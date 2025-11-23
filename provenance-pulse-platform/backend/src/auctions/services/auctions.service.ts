import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { CreateAuctionDto } from '../dto/create-auction.dto';

@Injectable()
export class AuctionsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, dto: CreateAuctionDto) {
    const auction = await this.prisma.auction.create({
      data: {
        tenantId,
        name: dto.name,
        category: dto.category,
        description: dto.description,
        startTime: new Date(dto.startTime),
        endTime: new Date(dto.endTime),
        expectedTotalHammerLow: dto.expectedTotalHammerLow,
        expectedTotalHammerHigh: dto.expectedTotalHammerHigh,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'CREATE',
        entityType: 'AUCTION',
        entityId: auction.id,
        metadata: { name: auction.name },
      },
    });

    return auction;
  }

  async findAll(tenantId: string, filters: {
    status?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }) {
    const where: any = { tenantId };

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.startDate || filters.endDate) {
      where.startTime = {};
      if (filters.startDate) {
        where.startTime.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        where.startTime.lte = new Date(filters.endDate);
      }
    }

    return this.prisma.auction.findMany({
      where,
      include: {
        _count: { select: { lots: true } },
      },
      orderBy: { startTime: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const auction = await this.prisma.auction.findFirst({
      where: { id, tenantId },
      include: {
        lots: {
          include: {
            _count: { select: { bids: true } },
          },
        },
      },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Calculate summary KPIs
    const lots = auction.lots;
    const soldLots = lots.filter(l => l.status === 'SOLD');
    const totalEstimateLow = lots.reduce((sum, l) => sum + l.estimateLow, 0);
    const totalEstimateHigh = lots.reduce((sum, l) => sum + l.estimateHigh, 0);
    const totalHammer = soldLots.reduce((sum, l) => sum + (l.hammerPrice || 0), 0);
    const sellThroughRate = lots.length > 0 ? soldLots.length / lots.length : 0;

    return {
      ...auction,
      summary: {
        totalLots: lots.length,
        soldLots: soldLots.length,
        totalEstimateLow,
        totalEstimateHigh,
        totalHammer,
        sellThroughRate,
      },
    };
  }

  async update(tenantId: string, id: string, dto: Partial<CreateAuctionDto>) {
    const auction = await this.prisma.auction.findFirst({
      where: { id, tenantId },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    const updated = await this.prisma.auction.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.category && { category: dto.category }),
        ...(dto.description && { description: dto.description }),
        ...(dto.startTime && { startTime: new Date(dto.startTime) }),
        ...(dto.endTime && { endTime: new Date(dto.endTime) }),
        ...(dto.expectedTotalHammerLow !== undefined && { expectedTotalHammerLow: dto.expectedTotalHammerLow }),
        ...(dto.expectedTotalHammerHigh !== undefined && { expectedTotalHammerHigh: dto.expectedTotalHammerHigh }),
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'UPDATE',
        entityType: 'AUCTION',
        entityId: id,
        metadata: dto,
      },
    });

    return updated;
  }
}
