import { Module } from '@nestjs/common';
import { AuctionControlController } from './controllers/auction-control.controller';
import { LuxuryControlController } from './controllers/luxury-control.controller';
import { AuctionControlService } from './services/auction-control.service';
import { LuxuryControlService } from './services/luxury-control.service';
import { PrismaService } from '../db/prisma.service';

@Module({
  controllers: [AuctionControlController, LuxuryControlController],
  providers: [AuctionControlService, LuxuryControlService, PrismaService],
})
export class ControlTowerModule {}
