import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PredictiveService } from './predictive/predictive.service';
import { ProvenanceService } from './provenance/provenance.service';
import { CatalogService } from './catalog/catalog.service';
import { EngagementService } from './engagement/engagement.service';
import { PrismaService } from '../db/prisma.service';

@Module({
  imports: [HttpModule],
  providers: [
    PredictiveService,
    ProvenanceService,
    CatalogService,
    EngagementService,
    PrismaService,
  ],
  exports: [
    PredictiveService,
    ProvenanceService,
    CatalogService,
    EngagementService,
  ],
})
export class IntelligenceModule {}
