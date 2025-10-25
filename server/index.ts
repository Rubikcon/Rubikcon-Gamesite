import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import { createClient } from "redis";
import { RedisStore } from "connect-redis";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Augment the Express Request type to include our custom rawBody property
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

async function main() {
  const app = express();
  app.use(express.json({ 
    verify: (req: Request, res, buf) => {
      // We only need the raw body for the webhook route
      if (req.originalUrl.startsWith('/api/webhook')) {
        req.rawBody = buf;
      }
    }
  }));
  app.use(express.urlencoded({ extended: false }));

  // Trust the first proxy
  app.set('trust proxy', 1);

  // Session configuration
  let sessionConfig: any = {
    secret: process.env.SESSION_SECRET || 'rubikcon-games-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  // Use Redis if URL is provided, otherwise use memory store
  if (process.env.REDIS_URL) {
    try {
      const redisClient = createClient({
        url: process.env.REDIS_URL,
      });
      redisClient.on('error', err => log(`Redis Client Error: ${err}`));
      redisClient.on('connect', () => log('Redis Client Connected'));
      await redisClient.connect();

      const redisStore = new RedisStore({
        client: redisClient,
        prefix: "rubikcon:",
      });
      sessionConfig.store = redisStore;
      log('Using Redis for sessions');
    } catch (error) {
      log(`Redis connection failed, using memory store: ${error}`);
    }
  } else {
    log('Using in-memory sessions (Redis URL not provided)');
  }

  app.use(session(sessionConfig));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = process.env.PORT || 5000;
  server.listen(port, () => {
    log(`serving on port ${port}`);
  });
}

main().catch(err => {
  log(`Error starting server: ${err}`);
  process.exit(1);
});
