import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { LuxuryControlService } from '../services/luxury-control.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@Controller('luxury/control-tower')
@UseGuards(JwtAuthGuard)
export class LuxuryControlController {
  constructor(private luxuryControlService: LuxuryControlService) {}

  @Get('overview')
  async getOverview(@Request() req: any) {
    return this.luxuryControlService.getOverview(req.user.tenantId);
  }
}
