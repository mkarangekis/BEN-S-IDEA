import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { LotsService } from '../services/lots.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateLotDto } from '../dto/create-lot.dto';

@Controller('auction/lots')
@UseGuards(JwtAuthGuard)
export class LotsController {
  constructor(private lotsService: LotsService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateLotDto) {
    return this.lotsService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('auctionId') auctionId?: string,
    @Query('status') status?: string,
    @Query('category') category?: string,
  ) {
    return this.lotsService.findAll(req.user.tenantId, { auctionId, status, category });
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.lotsService.findOne(req.user.tenantId, id);
  }

  @Post(':id/predict-hammer')
  async predictHammer(@Request() req: any, @Param('id') id: string) {
    return this.lotsService.predictHammerPrice(req.user.tenantId, id);
  }

  @Post(':id/generate-description')
  async generateDescription(@Request() req: any, @Param('id') id: string) {
    return this.lotsService.generateDescription(req.user.tenantId, id);
  }

  @Post(':id/score-provenance')
  async scoreProvenance(@Request() req: any, @Param('id') id: string) {
    return this.lotsService.scoreProvenance(req.user.tenantId, id);
  }
}
