import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuctionControlService } from '../services/auction-control.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('auction/control-tower')
@UseGuards(JwtAuthGuard)
export class AuctionControlController {
  constructor(private auctionControlService: AuctionControlService) {}

  @Get('overview')
  async getOverview(@Request() req: any) {
    return this.auctionControlService.getOverview(req.user.tenantId);
  }
}
