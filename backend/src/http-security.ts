import type { INestApplication } from '@nestjs/common';
import { json, Request, Response, NextFunction } from 'express';
export function configureHttpSecurity(app: INestApplication) {
  const origins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use((req: Request, res: Response, next: NextFunction) => {
    if ((req.headers.origin && !origins.includes(req.headers.origin)) || req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).end();
    next();
  });
  app.use(json({ limit: '8kb' }));
  app.enableCors({ origin: origins, credentials: true });
}
