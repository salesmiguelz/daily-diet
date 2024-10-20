import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import knex from '../database/database-connection'
import { randomUUID } from 'crypto'

export default async (app: FastifyInstance) => {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const meals = await knex('meals').select('*')

    return reply.send({ meals })
  })

  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const meal = z.object({
      name: z.string(),
      dateAndTime: z.string().datetime(),
      isWithinDiet: z.boolean(),
    })
    const { name, dateAndTime, isWithinDiet } = meal.parse(request.body)
    await knex('meals').insert({
      id: randomUUID(),
      name,
      dateAndTime,
      isWithinDiet,
    })
    return reply.send(201)
  })
}
