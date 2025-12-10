import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import dotenv from 'dotenv';
import Fastify from 'fastify';
import { fileURLToPath } from 'url';
import userRoutes from './modules/user/user.routes.js';
import { prismaPlugin } from './plugins/prisma.js';

const isMain = process.argv[1] === fileURLToPath(import.meta.url);

dotenv.config();

export const build = async () => {
  const fastify = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || 'silent', // Silent in tests
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
        },
      },
    },
  });

  // Register plugins
  await fastify.register(prismaPlugin);
  await fastify.register(cors, { origin: true });
  await fastify.register(helmet);
  await fastify.register(rateLimit);
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: 'StormForge API',
        version: '1.0.0',
        description: 'Production-ready REST API framework',
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
};

export const start = async () => {
  const fastify = await build();

  try {
    await fastify.listen({
      port: Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
    });
    fastify.log.info(`StormForge running on http://localhost:${process.env.PORT || 3000}`);
    fastify.log.info(`Swagger docs: http://localhost:${process.env.PORT || 3000}/docs`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  process.on('SIGTERM', async () => {
    await fastify.close();
    process.exit(0);
  });
};

if (isMain) {
  start();
}
