import { Module } from '@nestjs/common';
import { AuditService } from './audit/audit.service';
import { FraudService } from './fraud/fraud.service';
import { PrismaService } from '../db/prisma.service';

@Module({
  providers: [AuditService, FraudService, PrismaService],
  exports: [AuditService, FraudService],
})
export class GovernanceModule {}
