import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import knex from '../database/database-connection'
import { randomUUID } from 'crypto'

export default async (app: FastifyInstance) => {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const meals = await knex('meals').select('*')

    return reply.send({ meals })
  })

  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals').where('id', id).first()

    reply.send({ meal })
  })

  app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const patchMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const patchMealBodySchema = z
      .object({
        name: z.string().optional(),
        dateAndTime: z.string().optional(),
        isWithinDiet: z.boolean().optional(),
      })
      .refine(
        ({ name, dateAndTime, isWithinDiet }) =>
          name || dateAndTime || isWithinDiet,
        { message: 'One of the required fields must be defined' },
      )
    const { id } = patchMealParamsSchema.parse(request.params)
    const mealFieldsToBePatched = patchMealBodySchema.parse(request.body)

    await knex('meals')
      .update({
        ...mealFieldsToBePatched,
      })
      .where('id', id)

    reply.send(200)
  })

  app.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })
    const updateMealBodySchema = z.object({
      name: z.string(),
      dateAndTime: z.string(),
      isWithinDiet: z.boolean(),
    })

    const { id } = updateMealParamsSchema.parse(request.params)

    const { name, dateAndTime, isWithinDiet } = updateMealBodySchema.parse(
      request.body,
    )

    await knex('meals')
      .update({
        name,
        dateAndTime,
        isWithinDiet,
      })
      .where('id', id)

    reply.send(200)
  })

  app.delete('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    await knex('meals').delete(id)

    return reply.send(200)
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
