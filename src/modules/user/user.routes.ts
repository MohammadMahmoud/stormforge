import { FastifyInstance, RegisterOptions } from 'fastify';
import { createUserSchema, getUsersSchema, schemas } from './user.schema.js';

export default async function userRoutes(fastify: FastifyInstance, opts: RegisterOptions) {
  // Register ALL schemas first
  Object.values(schemas).forEach((schema) => fastify.addSchema(schema));

  // Create user
  fastify.post('/', {
    schema: createUserSchema,
    handler: async (request, reply) => {
      const { email, name } = request.body as any;
      const user = await fastify.prisma.user.create({
        data: { email, name },
      });
      return reply.code(201).send(user);
    },
  });

  // List users
  fastify.get('/', {
    schema: getUsersSchema,
    handler: async (request, reply) => {
      const users = await fastify.prisma.user.findMany({
        select: { id: true, email: true, name: true },
      });
      return { users };
    },
  });
}
