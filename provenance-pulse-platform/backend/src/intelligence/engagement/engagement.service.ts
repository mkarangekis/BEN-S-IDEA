import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../db/prisma.service';

@Injectable()
export class EngagementService {
  constructor(private prisma: PrismaService) {}

  async createWorkflow(tenantId: string, data: {
    name: string;
    triggerType: string;
    config: any;
  }) {
    return this.prisma.engagementWorkflow.create({
      data: {
        tenantId,
        name: data.name,
        triggerType: data.triggerType,
        config: data.config,
      },
    });
  }

  async listWorkflows(tenantId: string) {
    return this.prisma.engagementWorkflow.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async triggerWorkflow(tenantId: string, workflowId: string, target: {
    targetType: string;
    targetId: string;
  }) {
    const workflow = await this.prisma.engagementWorkflow.findFirst({
      where: { id: workflowId, tenantId },
    });

    if (!workflow) {
      throw new Error('Workflow not found');
    }

    // Create engagement event
    const event = await this.prisma.engagementEvent.create({
      data: {
        workflowId,
        targetType: target.targetType,
        targetId: target.targetId,
        eventType: 'WORKFLOW_TRIGGERED',
        payload: workflow.config,
      },
    });

    // In production, this would trigger actual actions (emails, notifications, etc.)
    return {
      eventId: event.id,
      status: 'TRIGGERED',
      message: `Workflow "${workflow.name}" triggered for ${target.targetType} ${target.targetId}`,
    };
  }

  async scoreBuyer(input: {
    buyerId: string;
    lifetimeSpend: number;
    purchaseCount: number;
    lastPurchaseDate: Date;
  }) {
    // Simple scoring algorithm
    const spendScore = Math.min(input.lifetimeSpend / 100000, 1) * 0.4;
    const frequencyScore = Math.min(input.purchaseCount / 20, 1) * 0.3;

    const daysSinceLastPurchase = Math.floor(
      (Date.now() - input.lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyScore = Math.max(0, 1 - daysSinceLastPurchase / 365) * 0.3;

    const activationScore = spendScore + frequencyScore + recencyScore;

    return {
      activationScore: Math.round(activationScore * 100) / 100,
      segment: activationScore > 0.7 ? 'VIP' : activationScore > 0.4 ? 'ACTIVE' : 'AT_RISK',
      recommendations: activationScore < 0.4
        ? ['Send reactivation email', 'Offer exclusive preview']
        : [],
    };
  }
}
