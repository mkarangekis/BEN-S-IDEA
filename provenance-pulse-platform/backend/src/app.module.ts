import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { AuctionsModule } from './auctions/auctions.module';
import { LuxuryModule } from './luxury/luxury.module';
import { IntelligenceModule } from './intelligence/intelligence.module';
import { ControlTowerModule } from './control-tower/control-tower.module';
import { IntegrationModule } from './integration/integration.module';
import { GovernanceModule } from './governance/governance.module';
import { PrismaService } from './db/prisma.service';
import { TenantMiddleware } from './tenants/tenant.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    AuthModule,
    TenantsModule,
    AuctionsModule,
    LuxuryModule,
    IntelligenceModule,
    ControlTowerModule,
    IntegrationModule,
    GovernanceModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(TenantMiddleware)
      .exclude('api/auth/(.*)')
      .forRoutes('*');
  }
}
