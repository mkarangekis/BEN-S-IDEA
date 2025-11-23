import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Tenant ID will be extracted from JWT in the auth guard
    // This middleware can be used for additional tenant-specific logic
    next();
  }
}
