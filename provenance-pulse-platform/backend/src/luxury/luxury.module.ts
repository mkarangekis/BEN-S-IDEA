import { Module } from '@nestjs/common';
import { ListingsController } from './controllers/listings.controller';
import { ListingsService } from './services/listings.service';
import { PrismaService } from '../db/prisma.service';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [IntelligenceModule],
  controllers: [ListingsController],
  providers: [ListingsService, PrismaService],
  exports: [ListingsService],
})
export class LuxuryModule {}
