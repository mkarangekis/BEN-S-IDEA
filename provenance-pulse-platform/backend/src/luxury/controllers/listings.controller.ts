import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ListingsService } from '../services/listings.service';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { CreateListingDto } from '../dto/create-listing.dto';

@Controller('luxury')
@UseGuards(JwtAuthGuard)
export class ListingsController {
  constructor(private listingsService: ListingsService) {}

  @Post('listings')
  async create(@Request() req: any, @Body() dto: CreateListingDto) {
    return this.listingsService.create(req.user.tenantId, dto);
  }

  @Get('listings')
  async findAll(
    @Request() req: any,
    @Query('status') status?: string,
    @Query('brand') brand?: string,
    @Query('category') category?: string,
  ) {
    return this.listingsService.findAll(req.user.tenantId, { status, brand, category });
  }

  @Get('listings/:id')
  async findOne(@Request() req: any, @Param('id') id: string) {
    return this.listingsService.findOne(req.user.tenantId, id);
  }

  @Post('predict/pricing')
  async predictPricing(@Request() req: any, @Body() body: { listingId: string }) {
    return this.listingsService.predictPricing(req.user.tenantId, body.listingId);
  }

  @Post('catalog/grade-condition')
  async gradeCondition(@Request() req: any, @Body() body: { listingId: string }) {
    return this.listingsService.gradeCondition(req.user.tenantId, body.listingId);
  }

  @Post('authentication/submit-job')
  async submitAuthJob(@Request() req: any, @Body() body: { listingId: string }) {
    return this.listingsService.submitAuthenticationJob(req.user.tenantId, body.listingId);
  }

  @Get('authentication/queue')
  async getAuthQueue(@Request() req: any) {
    return this.listingsService.getAuthenticationQueue(req.user.tenantId);
  }
}
