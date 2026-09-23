import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Cache for 60 seconds by default
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export const cacheMiddleware = (duration?: number) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl || req.url;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      res.json(cachedResponse);
      return;
    } else {
      // Overwrite res.json to capture the response and store it in cache
      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (duration) {
          cache.set(key, body, duration);
        } else {
          cache.set(key, body);
        }
        return originalJson(body);
      };
      next();
    }
  };
};

export const clearCache = (keyPattern?: string) => {
  if (keyPattern) {
    const keys = cache.keys();
    const keysToDelete = keys.filter(k => k.includes(keyPattern));
    cache.del(keysToDelete);
  } else {
    cache.flushAll();
  }
};
