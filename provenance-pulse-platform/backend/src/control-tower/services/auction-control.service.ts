import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class AuctionControlService {
  constructor(private prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    // Get recent auctions
    const auctions = await this.prisma.auction.findMany({
      where: { tenantId },
      include: { lots: true },
      orderBy: { startTime: 'desc' },
      take: 10,
    });

    // Calculate metrics
    const completedAuctions = auctions.filter(a => a.status === 'COMPLETED');
    const allLots = auctions.flatMap(a => a.lots);
    const soldLots = allLots.filter(l => l.status === 'SOLD');

    // Hammer price accuracy
    const lotsWithPredictions = soldLots.filter(l => l.predictedHammer && l.hammerPrice);
    const accuracySum = lotsWithPredictions.reduce((sum, lot) => {
      const error = Math.abs((lot.hammerPrice! - lot.predictedHammer!) / lot.hammerPrice!);
      return sum + (1 - error);
    }, 0);
    const hammerPriceAccuracy = lotsWithPredictions.length > 0
      ? accuracySum / lotsWithPredictions.length
      : 0;

    // Sell-through rate
    const sellThroughRate = allLots.length > 0
      ? soldLots.length / allLots.length
      : 0;

    // Revenue by category
    const revenueByCategory: Record<string, number> = {};
    soldLots.forEach(lot => {
      revenueByCategory[lot.category] = (revenueByCategory[lot.category] || 0) + (lot.hammerPrice || 0);
    });

    // Bidder metrics
    const bidders = await this.prisma.bidder.findMany({
      where: { tenantId },
    });
    const activeBidders = bidders.filter(b => (b.activationScore || 0) > 0.5);

    return {
      summary: {
        totalAuctions: auctions.length,
        completedAuctions: completedAuctions.length,
        totalLots: allLots.length,
        soldLots: soldLots.length,
        totalRevenue: soldLots.reduce((sum, l) => sum + (l.hammerPrice || 0), 0),
      },
      metrics: {
        hammerPriceAccuracy: Math.round(hammerPriceAccuracy * 100) / 100,
        sellThroughRate: Math.round(sellThroughRate * 100) / 100,
        averageLotsPerAuction: auctions.length > 0
          ? Math.round(allLots.length / auctions.length)
          : 0,
      },
      revenueByCategory: Object.entries(revenueByCategory).map(([category, revenue]) => ({
        category,
        revenue,
      })),
      bidderMetrics: {
        totalBidders: bidders.length,
        activeBidders: activeBidders.length,
        vipBidders: bidders.filter(b => b.vipFlag).length,
        averageActivationScore: bidders.length > 0
          ? Math.round((bidders.reduce((sum, b) => sum + (b.activationScore || 0), 0) / bidders.length) * 100) / 100
          : 0,
      },
      recentAuctions: auctions.slice(0, 5).map(a => ({
        id: a.id,
        name: a.name,
        status: a.status,
        startTime: a.startTime,
        lotCount: a.lots.length,
        soldCount: a.lots.filter(l => l.status === 'SOLD').length,
      })),
    };
  }
}
