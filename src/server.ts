import compress from '@fastify/compress';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import { fileURLToPath } from 'url';
import userRoutes from './modules/user/user.routes.js';
import { prismaPlugin } from './plugins/prisma.js';

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

dotenv.config();

export async function build() {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'development' ? 'info' : 'warn'),
      transport:
        process.env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    disableRequestLogging: process.env.NODE_ENV === 'production',
  });

  // Register plugins in recommended order
  await fastify.register(sensible); // Adds httpErrors, asserts, etc.
  await fastify.register(prismaPlugin);
  await fastify.register(compress, {
    global: true,
    encodings: ['gzip', 'deflate'],
    threshold: 1024,
  });
  await fastify.register(cors, {
    origin:
      process.env.NODE_ENV === 'production' ? process.env.ALLOWED_ORIGINS?.split(',') || [] : true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  });
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
      },
    },
    crossOriginEmbedderPolicy: false, // For Swagger UI
  });
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute',
    allowList: ['127.0.0.1'],
    skipOnError: false,
  });
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'StormForge API',
        version: '1.0.0',
        description: 'Production-ready REST API framework',
        contact: {
          name: 'API Support',
          email: process.env.SUPPORT_EMAIL,
        },
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === 'production'
              ? `https://${process.env.DOMAIN || 'localhost'}`
              : `http://localhost:${process.env.PORT}`,
          description: `${process.env.NODE_ENV} server`,
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  });
  await fastify.register(swaggerUi, { routePrefix: '/docs' });

  // Health check
  fastify.get('/health', async () => ({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  // Routes
  await fastify.register(userRoutes, { prefix: '/api/users' });

  return fastify;
}

// Graceful shutdown setup
function setupGracefulShutdown(fastify: Fastify.FastifyInstance) {
  const signals = ['SIGTERM', 'SIGINT'];

  signals.forEach((signal) => {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, starting graceful shutdown...`);
      try {
        await fastify.close();
        fastify.log.info('Server closed successfully');
        process.exit(0);
      } catch (err: any) {
        fastify.log.error('Error during graceful shutdown:', err);
        process.exit(1);
      }
    });
  });
}

async function start() {
  const fastify = await build();

  // Setup graceful shutdown
  setupGracefulShutdown(fastify);

  try {
    const address = await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1',
      listenTextResolver: (address) => {
        return `StormForge server listening at ${address}`;
      },
    });

    fastify.log.info(`Server started in ${process.env.NODE_ENV || 'development'} mode`);
    fastify.log.info(`API Documentation: ${address}/docs`);
    fastify.log.info(`Health Check: ${address}/health`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

if (isMain) {
  start();
}
