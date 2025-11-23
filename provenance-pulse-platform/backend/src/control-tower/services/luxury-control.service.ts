import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class LuxuryControlService {
  constructor(private prisma: PrismaService) {}

  async getOverview(tenantId: string) {
    // Get listings
    const listings = await this.prisma.listing.findMany({
      where: { tenantId },
      include: { authenticationJobs: true },
    });

    // Authentication queue metrics
    const authJobs = await this.prisma.authenticationJob.findMany({
      where: { listing: { tenantId } },
    });

    const queuedJobs = authJobs.filter(j => j.status === 'QUEUED');
    const completedJobs = authJobs.filter(j => j.status === 'COMPLETED');

    // Calculate average cycle time
    const jobsWithTime = completedJobs.filter(j => j.completedAt);
    const avgCycleTime = jobsWithTime.length > 0
      ? jobsWithTime.reduce((sum, j) => {
          return sum + (j.completedAt!.getTime() - j.createdAt.getTime());
        }, 0) / jobsWithTime.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    // Counterfeit risk distribution
    const riskDistribution = {
      high: authJobs.filter(j => (j.counterfeitRiskScore || 0) > 0.7).length,
      medium: authJobs.filter(j => {
        const score = j.counterfeitRiskScore || 0;
        return score > 0.3 && score <= 0.7;
      }).length,
      low: authJobs.filter(j => (j.counterfeitRiskScore || 0) <= 0.3).length,
    };

    // Margin by category
    const marginByCategory: Record<string, { revenue: number; margin: number }> = {};
    const soldListings = listings.filter(l => l.status === 'SOLD');
    soldListings.forEach(listing => {
      if (!marginByCategory[listing.category]) {
        marginByCategory[listing.category] = { revenue: 0, margin: 0 };
      }
      marginByCategory[listing.category].revenue += listing.predictedPrice || listing.askingPrice;
      marginByCategory[listing.category].margin += listing.marginProjection || 0;
    });

    // Buyer/Seller metrics
    const buyers = await this.prisma.buyerAccount.findMany({ where: { tenantId } });
    const sellers = await this.prisma.sellerAccount.findMany({ where: { tenantId } });

    return {
      summary: {
        totalListings: listings.length,
        activeListings: listings.filter(l => l.status === 'LISTED').length,
        soldListings: soldListings.length,
        totalGMV: soldListings.reduce((sum, l) => sum + (l.predictedPrice || l.askingPrice), 0),
      },
      authentication: {
        queueSize: queuedJobs.length,
        inProgress: authJobs.filter(j => j.status === 'IN_PROGRESS').length,
        avgCycleTimeHours: Math.round(avgCycleTime * 10) / 10,
        completedToday: completedJobs.filter(j => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          return j.completedAt && j.completedAt >= today;
        }).length,
      },
      riskDistribution,
      marginByCategory: Object.entries(marginByCategory).map(([category, data]) => ({
        category,
        revenue: data.revenue,
        avgMargin: data.margin / (soldListings.filter(l => l.category === category).length || 1),
      })),
      buyerMetrics: {
        total: buyers.length,
        vip: buyers.filter(b => b.vipFlag).length,
        repeatBuyers: buyers.filter(b => (b.repeatRate || 0) > 0).length,
      },
      sellerMetrics: {
        total: sellers.length,
        totalGMV: sellers.reduce((sum, s) => sum + s.lifetimeGrossMerchandiseValue, 0),
      },
    };
  }
}
