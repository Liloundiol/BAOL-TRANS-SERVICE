"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearCache = exports.cacheMiddleware = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
// Cache for 60 seconds by default
const cache = new node_cache_1.default({ stdTTL: 60, checkperiod: 120 });
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        // Only cache GET requests
        if (req.method !== 'GET') {
            return next();
        }
        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);
        if (cachedResponse) {
            res.json(cachedResponse);
            return;
        }
        else {
            // Overwrite res.json to capture the response and store it in cache
            const originalJson = res.json.bind(res);
            res.json = (body) => {
                if (duration) {
                    cache.set(key, body, duration);
                }
                else {
                    cache.set(key, body);
                }
                return originalJson(body);
            };
            next();
        }
    };
};
exports.cacheMiddleware = cacheMiddleware;
const clearCache = (keyPattern) => {
    if (keyPattern) {
        const keys = cache.keys();
        const keysToDelete = keys.filter(k => k.includes(keyPattern));
        cache.del(keysToDelete);
    }
    else {
        cache.flushAll();
    }
};
exports.clearCache = clearCache;
