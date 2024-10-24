import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { z } from 'zod'
import knex from '../../database/database-connection'
import { randomUUID } from 'crypto'
import checkUserIsLogged from '../middleware/check-user-is-logged'

export default async (app: FastifyInstance) => {
  app.get(
    '/',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: userId } = await knex('users')
        .select('id')
        .where('session_id', request.cookies.sessionId)
        .first()

      const meals = await knex('meals').select('*').where('user_id', userId)
      reply.status(200).send({ meals })
    },
  )

  app.get(
    '/:id',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        reply.status(401).send()
      }

      reply.status(200).send({ meal })
    },
  )
  app.post(
    '/',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
      const createMealResponse = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          dateAndTime,
          isWithinDiet,
          user_id: userId,
          created_at: new Date(),
        })
        .returning('*')
      reply.status(201).send(...createMealResponse)
    },
  )

  app.patch(
    '/:id',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        reply.status(401).send()
      }

      reply.status(200).send()
    },
  )

  app.put(
    '/:id',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        reply.status(401).send()
      }

      reply.status(200).send()
    },
  )

  app.delete(
    '/:id',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
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
        reply.status(401).send()
      }
      reply.status(200).send()
    },
  )

  app.get(
    '/:id/metrics',
    { preHandler: [checkUserIsLogged] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const metricsParamsSchema = z.object({
        id: z.string().uuid(),
      })
      const { id: requestedUserId } = metricsParamsSchema.parse(request.params)
      const { id: loggedUserId } = await knex('users')
        .select('id')
        .where('session_id', request.cookies.sessionId)
        .first()

      if (requestedUserId !== loggedUserId) {
        reply.status(401).send()
      }

      const numberOfMeals = await knex('meals')
        .where('user_id', requestedUserId)
        .count('* as numberOfMeals')
        .first()

      const mealsWithinDiet = await knex('meals')
        .where({
          user_id: requestedUserId,
          isWithinDiet: true,
        })
        .count('* as mealsWithinDiet')
        .first()

      const mealsOutsideDiet = await knex('meals')
        .where({
          user_id: requestedUserId,
          isWithinDiet: false,
        })
        .count('* as mealsOutsideDiet')
        .first()

      const meals = await knex('meals')
        .select('isWithinDiet')
        .where('user_id', requestedUserId)
        .orderBy('created_at', 'desc')

      let streakCounter = 0
      const streakArray: number[] = []
      meals.forEach((meal) => {
        if (meal.isWithinDiet) {
          streakCounter++
        } else {
          streakArray.push(streakCounter)
          streakCounter = 0
        }
      })
      const bestStreakOfMealWithinDiet = streakArray.length
        ? Math.max(...streakArray)
        : streakCounter
      reply.status(200).send({
        ...numberOfMeals,
        ...mealsWithinDiet,
        ...mealsOutsideDiet,
        bestStreakOfMealWithinDiet,
      })
    },
  )
}
