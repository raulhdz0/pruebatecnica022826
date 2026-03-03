import { Request, Response, NextFunction } from "express";
import { getRateLimitEntry, incrementCount } from "../helpers/rateLimitStore";

interface RateLimitOptions {
    windowMs: number;
    max: number;
    message?: string;
}

const rateLimit = (options: RateLimitOptions) => {
    const { windowMs, max, message = "Demasiadas solicitudes. Intente más tarde." } = options;

    return (req: Request, res: Response, next: NextFunction): void => {
        const ip = req.ip || req.socket.remoteAddress || "unknown";
        const key = `${ip}.${req.path}`;

        const entry = getRateLimitEntry(key, windowMs);

        // Headers informativos para el cliente
        res.setHeader("X-RateLimit-Limit", max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, max - entry.count - 1));
        res.setHeader("X-RateLimit-Reset", new Date(entry.resetAt).toISOString());

        if (entry.count >= max) {
            res.status(429).json({
                message,
                retryAfter: new Date(entry.resetAt).toISOString(),
            });
            return;
        }

        incrementCount(key);
        next();
    };
};

export default rateLimit;
