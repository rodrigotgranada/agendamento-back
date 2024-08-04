import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LogRequestMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LogRequestMiddleware.name);

  use(req: Request, res: Response, next: NextFunction) {
    this.logger.log(`Request user: ${JSON.stringify(req.user)}`);
    console.log(`Request user: ${JSON.stringify(req.user)}`);
    next();
  }
}
