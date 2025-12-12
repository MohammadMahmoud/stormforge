import {
  createUserSchema,
  deleteUserSchema,
  getUserSchema,
  getUsersSchema,
  schemasList,
  updateUserSchema,
} from './user.schema.js';

import type { User } from '@prisma/client';
import { FastifyInstance } from 'fastify';

interface CreateUserBody {
  email: string;
  name?: string;
  avatar?: string;
}

interface UpdateUserBody {
  name?: string;
  avatar?: string;
  active?: boolean;
}

interface UserParams {
  id: string;
}

const userRoutes = async (fastify: FastifyInstance) => {
  // Register all schemas
  schemasList.forEach((schema) => fastify.addSchema(schema));

  // CREATE - POST /api/users
  fastify.post<{ Body: CreateUserBody }>('/', {
    schema: createUserSchema,
    handler: async (request, reply) => {
      try {
        const { email, name, avatar } = request.body;

        const existingUser = await fastify.prisma.user.findUnique({
          where: { email },
        });

        if (existingUser) {
          return reply.status(409).send({
            error: 'CONFLICT',
            message: `User with email ${email} already exists`,
          });
        }

        const user = await fastify.prisma.user.create({
          data: { email, name, avatar },
        });

        return reply.status(201).send(user);
      } catch (error: any) {
        if (error.code === 'P2002') {
          return reply.status(409).send({
            error: 'CONFLICT',
            message: `User with email ${request.body.email} already exists`,
          });
        }
        fastify.log.error(error);
        return reply.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong',
        });
      }
    },
  });

  // READ ALL - GET /api/users
  fastify.get('/', {
    schema: getUsersSchema,
    handler: async () => {
      const users = await fastify.prisma.user.findMany({
        select: { id: true, email: true, name: true, avatar: true, active: true },
      });
      return { users };
    },
  });

  // READ SINGLE - GET /api/users/:id
  fastify.get<{ Params: UserParams }>('/:id', {
    schema: getUserSchema,
    handler: async (request, reply) => {
      const { id } = request.params;
      const user = await fastify.prisma.user.findUnique({
        where: { id },
        select: { id: true, email: true, name: true, avatar: true, active: true },
      });

      if (!user) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: `User with id ${id} not found`,
        });
      }

      return user;
    },
  });

  // UPDATE - PATCH /api/users/:id
  fastify.patch<{ Params: UserParams; Body: UpdateUserBody }>('/:id', {
    schema: updateUserSchema,
    handler: async (request, reply) => {
      const { id } = request.params;
      const data = request.body;

      const user = await fastify.prisma.user.findUnique({ where: { id } });

      if (!user) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: `User with id ${id} not found`,
        });
      }

      const updatedUser = (await fastify.prisma.user.update({
        where: { id },
        data,
        select: { id: true, email: true, name: true, avatar: true, active: true },
      })) as User;

      return updatedUser;
    },
  });

  // DELETE - DELETE /api/users/:id
  fastify.delete<{ Params: UserParams }>('/:id', {
    schema: deleteUserSchema,
    handler: async (request, reply) => {
      const { id } = request.params;

      const user = await fastify.prisma.user.findUnique({ where: { id } });

      if (!user) {
        return reply.status(404).send({
          error: 'NOT_FOUND',
          message: `User with id ${id} not found`,
        });
      }

      await fastify.prisma.user.delete({ where: { id } });

      return reply.status(204).send();
    },
  });
};

export default userRoutes;
