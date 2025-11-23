import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  // Connectors and webhooks would be implemented here
  // Currently stubs for CRM, marketplace, and bidding engine integrations
})
export class IntegrationModule {}
