import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { PredictiveService } from '../../intelligence/predictive/predictive.service';
import { CatalogService } from '../../intelligence/catalog/catalog.service';
import { ProvenanceService } from '../../intelligence/provenance/provenance.service';
import { CreateLotDto } from '../dto/create-lot.dto';

@Injectable()
export class LotsService {
  constructor(
    private prisma: PrismaService,
    private predictiveService: PredictiveService,
    private catalogService: CatalogService,
    private provenanceService: ProvenanceService,
  ) {}

  async create(tenantId: string, dto: CreateLotDto) {
    // Verify auction belongs to tenant
    const auction = await this.prisma.auction.findFirst({
      where: { id: dto.auctionId, tenantId },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    // Get next lot number
    const lastLot = await this.prisma.lot.findFirst({
      where: { auctionId: dto.auctionId },
      orderBy: { lotNumber: 'desc' },
    });

    const lot = await this.prisma.lot.create({
      data: {
        auctionId: dto.auctionId,
        lotNumber: (lastLot?.lotNumber || 0) + 1,
        title: dto.title,
        category: dto.category,
        description: dto.description,
        artist: dto.artist,
        year: dto.year,
        medium: dto.medium,
        dimensions: dto.dimensions,
        estimateLow: dto.estimateLow,
        estimateHigh: dto.estimateHigh,
        reservePrice: dto.reservePrice,
        sellerId: dto.sellerId,
        imageUrls: dto.imageUrls || [],
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'CREATE',
        entityType: 'LOT',
        entityId: lot.id,
        metadata: { title: lot.title, auctionId: dto.auctionId },
      },
    });

    return lot;
  }

  async findAll(tenantId: string, filters: {
    auctionId?: string;
    status?: string;
    category?: string;
  }) {
    const where: any = {};

    if (filters.auctionId) {
      // Verify auction belongs to tenant
      const auction = await this.prisma.auction.findFirst({
        where: { id: filters.auctionId, tenantId },
      });
      if (!auction) {
        throw new NotFoundException('Auction not found');
      }
      where.auctionId = filters.auctionId;
    } else {
      // Get all lots from tenant's auctions
      where.auction = { tenantId };
    }

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.category) {
      where.category = filters.category;
    }

    return this.prisma.lot.findMany({
      where,
      include: {
        auction: { select: { name: true } },
        _count: { select: { bids: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const lot = await this.prisma.lot.findFirst({
      where: { id, auction: { tenantId } },
      include: {
        auction: true,
        seller: true,
        bids: {
          orderBy: { timestamp: 'desc' },
          take: 20,
          include: { bidder: { select: { name: true, segment: true } } },
        },
      },
    });

    if (!lot) {
      throw new NotFoundException('Lot not found');
    }

    return lot;
  }

  async predictHammerPrice(tenantId: string, lotId: string) {
    const lot = await this.findOne(tenantId, lotId);

    const prediction = await this.predictiveService.predictHammerPrice({
      estimateLow: lot.estimateLow,
      estimateHigh: lot.estimateHigh,
      category: lot.category,
      historicalVolatilityIndex: 0.15, // Default
    });

    // Update lot with prediction
    await this.prisma.lot.update({
      where: { id: lotId },
      data: {
        predictedHammer: prediction.predictedHammerPrice,
        confidenceLow: prediction.confidenceLower,
        confidenceHigh: prediction.confidenceUpper,
      },
    });

    // Log prediction
    await this.prisma.predictionLog.create({
      data: {
        tenantId,
        modelType: 'HAMMER_PRICE',
        inputSummary: {
          lotId,
          estimateLow: lot.estimateLow,
          estimateHigh: lot.estimateHigh,
        },
        outputSummary: prediction,
        score: prediction.predictedHammerPrice,
      },
    });

    return prediction;
  }

  async generateDescription(tenantId: string, lotId: string) {
    const lot = await this.findOne(tenantId, lotId);

    const result = await this.catalogService.generateDescription({
      title: lot.title,
      category: lot.category,
      artist: lot.artist,
      year: lot.year,
      medium: lot.medium,
      dimensions: lot.dimensions,
    });

    // Update lot with generated description
    await this.prisma.lot.update({
      where: { id: lotId },
      data: { description: result.description },
    });

    return result;
  }

  async scoreProvenance(tenantId: string, lotId: string) {
    const lot = await this.findOne(tenantId, lotId);

    const result = await this.provenanceService.scoreProvenance({
      lotId,
      category: lot.category,
      hasDocumentation: true, // Stub
      chainOfCustodyLength: 3, // Stub
    });

    // Update lot with scores
    await this.prisma.lot.update({
      where: { id: lotId },
      data: {
        provenanceScore: result.provenanceScore,
        authenticityScore: result.authenticityScore,
      },
    });

    return result;
  }
}
