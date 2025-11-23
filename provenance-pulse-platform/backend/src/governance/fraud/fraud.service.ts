import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class FraudService {
  constructor(private prisma: PrismaService) {}

  async createAlert(tenantId: string, data: {
    severity: string;
    category: string;
    message: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    return this.prisma.fraudAlert.create({
      data: {
        tenantId,
        ...data,
      },
    });
  }

  async getAlerts(tenantId: string, status?: string) {
    return this.prisma.fraudAlert.findMany({
      where: {
        tenantId,
        ...(status && { status }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateAlertStatus(tenantId: string, alertId: string, status: string) {
    return this.prisma.fraudAlert.updateMany({
      where: { id: alertId, tenantId },
      data: { status },
    });
  }
}
