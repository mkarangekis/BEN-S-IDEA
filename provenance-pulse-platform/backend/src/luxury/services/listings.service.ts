import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';
import { PredictiveService } from '../../intelligence/predictive/predictive.service';
import { CatalogService } from '../../intelligence/catalog/catalog.service';
import { CreateListingDto } from '../dto/create-listing.dto';

@Injectable()
export class ListingsService {
  constructor(
    private prisma: PrismaService,
    private predictiveService: PredictiveService,
    private catalogService: CatalogService,
  ) {}

  async create(tenantId: string, dto: CreateListingDto) {
    const listing = await this.prisma.listing.create({
      data: {
        tenantId,
        title: dto.title,
        brand: dto.brand,
        model: dto.model,
        category: dto.category,
        askingPrice: dto.askingPrice,
        sellerAccountId: dto.sellerAccountId,
        imageUrls: dto.imageUrls || [],
        metadata: dto.metadata,
      },
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        action: 'CREATE',
        entityType: 'LISTING',
        entityId: listing.id,
        metadata: { title: listing.title, brand: listing.brand },
      },
    });

    return listing;
  }

  async findAll(tenantId: string, filters: {
    status?: string;
    brand?: string;
    category?: string;
  }) {
    const where: any = { tenantId };

    if (filters.status) where.status = filters.status;
    if (filters.brand) where.brand = filters.brand;
    if (filters.category) where.category = filters.category;

    return this.prisma.listing.findMany({
      where,
      include: {
        authenticationJobs: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const listing = await this.prisma.listing.findFirst({
      where: { id, tenantId },
      include: {
        sku: true,
        sellerAccount: true,
        authenticationJobs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    return listing;
  }

  async predictPricing(tenantId: string, listingId: string) {
    const listing = await this.findOne(tenantId, listingId);

    const prediction = await this.predictiveService.predictPricing({
      brand: listing.brand,
      model: listing.model || '',
      category: listing.category,
      askingPrice: listing.askingPrice,
      conditionScore: listing.conditionScore || 3,
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        predictedPrice: prediction.predictedPrice,
        recommendedPrice: prediction.recommendedPrice,
        marginProjection: prediction.marginProjection,
      },
    });

    await this.prisma.predictionLog.create({
      data: {
        tenantId,
        modelType: 'LUXURY_PRICING',
        inputSummary: {
          listingId,
          brand: listing.brand,
          askingPrice: listing.askingPrice,
        },
        outputSummary: prediction,
        score: prediction.predictedPrice,
      },
    });

    return prediction;
  }

  async gradeCondition(tenantId: string, listingId: string) {
    const listing = await this.findOne(tenantId, listingId);

    const result = await this.catalogService.gradeCondition({
      category: listing.category,
      brand: listing.brand,
      imageUrls: listing.imageUrls,
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: {
        conditionScore: result.conditionScore,
        conditionNarrative: result.narrative,
      },
    });

    return result;
  }

  async submitAuthenticationJob(tenantId: string, listingId: string) {
    const listing = await this.findOne(tenantId, listingId);

    // Get queue position
    const queueCount = await this.prisma.authenticationJob.count({
      where: { status: 'QUEUED' },
    });

    const job = await this.prisma.authenticationJob.create({
      data: {
        listingId,
        queuePosition: queueCount + 1,
      },
    });

    await this.prisma.listing.update({
      where: { id: listingId },
      data: { status: 'AUTHENTICATION_PENDING' },
    });

    return job;
  }

  async getAuthenticationQueue(tenantId: string) {
    return this.prisma.authenticationJob.findMany({
      where: {
        listing: { tenantId },
        status: { in: ['QUEUED', 'IN_PROGRESS'] },
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            brand: true,
            askingPrice: true,
            category: true,
          },
        },
        assignedTo: {
          select: { firstName: true, lastName: true },
        },
      },
      orderBy: [
        { status: 'asc' },
        { queuePosition: 'asc' },
      ],
    });
  }
}
