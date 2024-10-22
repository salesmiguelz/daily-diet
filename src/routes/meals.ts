import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import knex from '../database/database-connection'
import { randomUUID } from 'crypto'

export default async (app: FastifyInstance) => {
  app.get('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = await knex('users')
      .select('id')
      .where('session_id', request.cookies.sessionId)
      .first()

    const meals = await knex('meals').select('*').where('user_id', userId)
    reply.status(200).send({ meals })
  })

  app.get('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = await knex('users')
      .select('id')
      .where('session_id', request.cookies.sessionId)
      .first()

    const getMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = getMealParamsSchema.parse(request.params)

    const meal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .first()

    if (!meal) {
      reply.status(403).send()
    }

    reply.status(200).send({ meal })
  })
  app.post('/', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = await knex('users')
      .select('id')
      .where('session_id', request.cookies.sessionId)
      .first()

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
      user_id: userId,
    })
    reply.status(201).send()
  })

  app.patch('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = await knex('users')
      .select('id')
      .where('session_id', request.cookies.sessionId)
      .first()

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

    const updatedMeal = await knex('meals')
      .update({
        ...mealFieldsToBePatched,
      })
      .where({ id, user_id: userId })

    if (!updatedMeal) {
      reply.status(403).send()
    }

    reply.status(200).send()
  })

  app.put('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = await knex('users')
      .select('id')
      .where('session_id', request.cookies.sessionId)
      .first()
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

    const updatedMeal = await knex('meals')
      .update({
        name,
        dateAndTime,
        isWithinDiet,
      })
      .where({ id, user_id: userId })

    if (!updatedMeal) {
      console.log('entrei')
      reply.status(403).send()
    }

    reply.status(200).send()
  })

  app.delete('/:id', async (request: FastifyRequest, reply: FastifyReply) => {
    const { id: userId } = await knex('users')
      .select('id')
      .where('session_id', request.cookies.sessionId)
      .first()
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)

    const deletedMeal = await knex('meals')
      .where({
        id,
        user_id: userId,
      })
      .del()

    if (!deletedMeal) {
      reply.status(403).send()
    }
    reply.status(200).send()
  })
}
