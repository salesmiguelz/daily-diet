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

    reply.send(200)
  })

  app.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const loginUserBodySchema = z.object({
      email: z.string(),
    })

    const { email } = loginUserBodySchema.parse(request.body)

    const loggedUser = await knex('users')
      .select('id', 'session_id')
      .where('email', email)
      .first()

    const sessionId = randomUUID()
    await knex('users')
      .update({
        session_id: sessionId,
      })
      .where('id', loggedUser.id)

    reply
      .send({
        sessionId,
      })
      .cookie('session_id', sessionId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
  })
}
