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
    })

    reply.send(201)
  })

  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const loginUserBodySchema = z.object({
      email: z.string(),
    })

    const { email } = loginUserBodySchema.parse(request.body)
    const user = await knex('users').select('id').where('email', email).first()

    if (!user) {
      reply.status(404).send({
        error: 'User not found!',
      })
    }

    const sessionId = randomUUID()

    await knex('users').where('id', user.id).update('session_id', sessionId)
    reply
      .cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
      .send({
        sessionId,
      })
  })
}
