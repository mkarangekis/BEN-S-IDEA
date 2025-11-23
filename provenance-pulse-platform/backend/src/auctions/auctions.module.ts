import { Module } from '@nestjs/common';
import { AuctionsController } from './controllers/auctions.controller';
import { LotsController } from './controllers/lots.controller';
import { AuctionsService } from './services/auctions.service';
import { LotsService } from './services/lots.service';
import { PrismaService } from '../db/prisma.service';
import { IntelligenceModule } from '../intelligence/intelligence.module';

@Module({
  imports: [IntelligenceModule],
  controllers: [AuctionsController, LotsController],
  providers: [AuctionsService, LotsService, PrismaService],
  exports: [AuctionsService, LotsService],
})
export class AuctionsModule {}
