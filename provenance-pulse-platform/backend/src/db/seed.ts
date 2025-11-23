import { PrismaClient, TenantType, UserRole, AuctionStatus, LotStatus, ListingStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Auction Pulse tenant
  const auctionTenant = await prisma.tenant.create({
    data: {
      name: 'Heritage Auctions Demo',
      type: TenantType.AUCTION_PULSE,
      planTier: 'enterprise',
    },
  });

  // Create Luxury Pulse tenant
  const luxuryTenant = await prisma.tenant.create({
    data: {
      name: 'LuxResale Demo',
      type: TenantType.LUXURY_PULSE,
      planTier: 'professional',
    },
  });

  const passwordHash = await bcrypt.hash('password123', 10);

  // Create users for Auction Pulse
  const auctionAdmin = await prisma.user.create({
    data: {
      email: 'admin@auctionpulse.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.ADMIN,
      tenantId: auctionTenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'analyst@auctionpulse.com',
      passwordHash,
      firstName: 'Michael',
      lastName: 'Chen',
      role: UserRole.ANALYST,
      tenantId: auctionTenant.id,
    },
  });

  // Create users for Luxury Pulse
  const luxuryAdmin = await prisma.user.create({
    data: {
      email: 'admin@luxurypulse.com',
      passwordHash,
      firstName: 'Emma',
      lastName: 'Williams',
      role: UserRole.ADMIN,
      tenantId: luxuryTenant.id,
    },
  });

  await prisma.user.create({
    data: {
      email: 'specialist@luxurypulse.com',
      passwordHash,
      firstName: 'James',
      lastName: 'Rodriguez',
      role: UserRole.SPECIALIST,
      tenantId: luxuryTenant.id,
    },
  });

  // Create sellers for Auction Pulse
  const seller1 = await prisma.seller.create({
    data: {
      tenantId: auctionTenant.id,
      name: 'Estate of Mr. Charles Wellington',
      email: 'estate@wellington.com',
      riskScore: 0.1,
      repeatRate: 0.8,
    },
  });

  // Create bidders
  await prisma.bidder.create({
    data: {
      tenantId: auctionTenant.id,
      name: 'Alexandra Morrison',
      email: 'alexandra@collector.com',
      segment: 'VIP',
      activationScore: 0.92,
      vipFlag: true,
      lifetimeSpend: 2500000,
    },
  });

  await prisma.bidder.create({
    data: {
      tenantId: auctionTenant.id,
      name: 'Robert Chen',
      email: 'robert.chen@investments.com',
      segment: 'PREMIUM',
      activationScore: 0.75,
      vipFlag: false,
      lifetimeSpend: 450000,
    },
  });

  // Create auction
  const auction = await prisma.auction.create({
    data: {
      tenantId: auctionTenant.id,
      name: 'Impressionist & Modern Art Evening Sale',
      category: 'Impressionist',
      description: 'Featuring masterworks from distinguished private collections',
      startTime: new Date('2024-03-15T18:00:00Z'),
      endTime: new Date('2024-03-15T22:00:00Z'),
      status: AuctionStatus.COMPLETED,
      expectedTotalHammerLow: 15000000,
      expectedTotalHammerHigh: 25000000,
      actualTotalHammer: 18750000,
    },
  });

  // Create lots
  await prisma.lot.create({
    data: {
      auctionId: auction.id,
      lotNumber: 1,
      title: 'Water Lilies',
      category: 'Impressionist',
      description: 'Oil on canvas, signed lower right',
      artist: 'Claude Monet',
      year: 1906,
      medium: 'Oil on canvas',
      dimensions: '89.5 x 100.3 cm',
      estimateLow: 4000000,
      estimateHigh: 6000000,
      reservePrice: 3500000,
      hammerPrice: 5200000,
      predictedHammer: 5100000,
      confidenceLow: 4335000,
      confidenceHigh: 5865000,
      status: LotStatus.SOLD,
      authenticityScore: 0.98,
      provenanceScore: 0.95,
      conditionScore: 4.5,
      conditionNarrative: 'Excellent condition. Minor craquelure consistent with age.',
      liquidityScore: 0.88,
      sellerId: seller1.id,
    },
  });

  await prisma.lot.create({
    data: {
      auctionId: auction.id,
      lotNumber: 2,
      title: 'Dancer in Green',
      category: 'Impressionist',
      artist: 'Edgar Degas',
      year: 1883,
      medium: 'Pastel on paper',
      dimensions: '48.3 x 35.6 cm',
      estimateLow: 2000000,
      estimateHigh: 3000000,
      reservePrice: 1800000,
      hammerPrice: 2850000,
      predictedHammer: 2600000,
      status: LotStatus.SOLD,
      authenticityScore: 0.96,
      provenanceScore: 0.92,
      conditionScore: 4.2,
      sellerId: seller1.id,
    },
  });

  // Create seller accounts for Luxury Pulse
  const sellerAccount = await prisma.sellerAccount.create({
    data: {
      tenantId: luxuryTenant.id,
      name: 'Victoria Laurent',
      email: 'victoria@consignments.com',
      valueScore: 0.85,
      lifetimeGrossMerchandiseValue: 125000,
      retentionScore: 0.9,
    },
  });

  // Create buyer accounts
  await prisma.buyerAccount.create({
    data: {
      tenantId: luxuryTenant.id,
      name: 'Sophie Anderson',
      email: 'sophie.a@email.com',
      segment: 'VIP',
      vipFlag: true,
      activationScore: 0.88,
      repeatRate: 0.7,
      lifetimeSpend: 85000,
    },
  });

  // Create SKUs
  const sku = await prisma.sKU.create({
    data: {
      tenantId: luxuryTenant.id,
      brand: 'Hermès',
      model: 'Birkin 25',
      referenceNumber: 'HB25-001',
      metadata: {
        material: 'Togo Leather',
        hardware: 'Gold',
      },
    },
  });

  // Create listings
  const listing1 = await prisma.listing.create({
    data: {
      tenantId: luxuryTenant.id,
      title: 'Hermès Birkin 25 Black Togo GHW',
      brand: 'Hermès',
      model: 'Birkin 25',
      category: 'Handbags',
      skuId: sku.id,
      status: ListingStatus.LISTED,
      askingPrice: 18500,
      predictedPrice: 17200,
      recommendedPrice: 16800,
      marginProjection: 0.32,
      conditionScore: 4.8,
      conditionNarrative: 'Pristine condition. Minimal signs of use.',
      authenticityScore: 0.99,
      sellerAccountId: sellerAccount.id,
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      tenantId: luxuryTenant.id,
      title: 'Chanel Classic Flap Medium Caviar',
      brand: 'Chanel',
      model: 'Classic Flap',
      category: 'Handbags',
      status: ListingStatus.AUTHENTICATION_PENDING,
      askingPrice: 8500,
      sellerAccountId: sellerAccount.id,
    },
  });

  // Create authentication jobs
  await prisma.authenticationJob.create({
    data: {
      listingId: listing2.id,
      status: 'QUEUED',
      queuePosition: 1,
    },
  });

  await prisma.listing.create({
    data: {
      tenantId: luxuryTenant.id,
      title: 'Rolex Submariner Date 126610LN',
      brand: 'Rolex',
      model: 'Submariner',
      category: 'Watches',
      status: ListingStatus.AUTHENTICATION_PENDING,
      askingPrice: 14500,
    },
  });

  // Create engagement workflows
  await prisma.engagementWorkflow.create({
    data: {
      tenantId: auctionTenant.id,
      name: 'VIP Bidder Reactivation',
      triggerType: 'INACTIVITY',
      status: 'ACTIVE',
      config: {
        segment: 'VIP',
        conditions: [
          { field: 'activationScore', operator: '<', value: 0.4 },
        ],
        actions: [
          { type: 'SEND_EMAIL', templateId: 'vip-reactivation-1' },
        ],
      },
    },
  });

  console.log('Seed data created successfully!');
  console.log('');
  console.log('Demo Credentials:');
  console.log('  Auction Pulse: admin@auctionpulse.com / password123');
  console.log('  Luxury Pulse: admin@luxurypulse.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
