import { FastifyInstance, RegisterOptions } from 'fastify'
import { schemas, createUserSchema, getUsersSchema } from './user.schema.js'
import type { User } from '@prisma/client'

interface CreateUserBody {
  email: string
  name?: string
}

export default async function userRoutes(fastify: FastifyInstance, opts: RegisterOptions) {
  // Register ALL schemas first
  Object.values(schemas).forEach(schema => fastify.addSchema(schema))

  // Create user with proper error handling
  fastify.post<{ Body: CreateUserBody }>('/', {
    schema: createUserSchema,
    handler: async (request, reply) => {
      try {
        const { email, name } = request.body
        
        // Check if email already exists
        const existingUser = await fastify.prisma.user.findUnique({
          where: { email }
        })

        if (existingUser) {
          return reply.status(409).send({
            error: 'CONFLICT',
            message: `User with email ${email} already exists`
          } as any)
        }

        const user = await fastify.prisma.user.create({
          data: { email, name }
        }) as User
        
        return reply.status(201).send(user)
      } catch (error: any) {
        fastify.log.error(error)
        
        if (error.code === 'P2002') {
          return reply.status(409).send({
            error: 'CONFLICT',
            message: `User with email ${request.body.email} already exists`
          } as any)
        }
        
        return reply.status(500).send({
          error: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong'
        } as any)
      }
    }
  })

  // List users
  fastify.get('/', {
    schema: getUsersSchema,
    handler: async (request, reply) => {
      const users = await fastify.prisma.user.findMany({
        select: { id: true, email: true, name: true }
      })
      return { users }
    }
  })
}
