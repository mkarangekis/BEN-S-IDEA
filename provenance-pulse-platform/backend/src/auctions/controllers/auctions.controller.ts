import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { AuctionsService } from '../services/auctions.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateAuctionDto } from '../dto/create-auction.dto';

@Controller('auction/auctions')
@UseGuards(JwtAuthGuard)
export class AuctionsController {
  constructor(private auctionsService: AuctionsService) {}

  @Post()
  async create(@Request() req: any, @Body() dto: CreateAuctionDto) {
    return this.auctionsService.create(req.user.tenantId, dto);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('category') category?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.auctionsService.findAll(req.user.tenantId, {
      status,
      category,
      startDate,
      endDate,
    });
  }

  @Get(':id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.auctionsService.findOne(req.user.tenantId, id);
  }

  @Put(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateAuctionDto>,
  ) {
    return this.auctionsService.update(req.user.tenantId, id, dto);
  }
}
