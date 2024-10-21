import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import knex from '../database/database-connection'
import { z } from 'zod'
import { randomUUID } from 'crypto'

export default async (app: FastifyInstance) => {
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: randomUUID(),
    })

    reply.send(200)
  })
}
