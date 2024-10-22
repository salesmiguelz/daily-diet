import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import supertest, { Response } from 'supertest'
import { execSync } from 'child_process'

describe('Meals Routes', () => {
  let loggedUserResponse: Response
  const meal = {
    name: 'Ratatouille',
    isWithinDiet: true,
    dateAndTime: '2024-10-20T13:51:50.744915Z',
  }

  beforeAll(async () => {
    await app.ready()
  })
  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')

    await supertest(app.server).post('/users').send({
      email: 'john.marston@gmail.com',
      name: 'John Marston',
    })
    loggedUserResponse = await supertest(app.server).post('/users/login').send({
      email: 'john.marston@gmail.com',
    })
  })

  it('should be able to create a meal', async () => {
    await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserResponse.get('Set-Cookie') ?? [])
      .send(meal)
      .expect(201)
  })

  it('should be able to list all the meals from an user', async () => {
    const loggedUserCookie = loggedUserResponse.get('Set-Cookie') ?? []
    await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)
      .expect(201)

    await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)
      .expect(201)

    await supertest(app.server).post('/users').send({
      email: 'arthur.morgan@gmail.com',
      name: 'Arthur Morgan',
    })

    const secondUserResponse = await supertest(app.server)
      .post('/users/login')
      .send({
        email: 'arthur.morgan@gmail.com',
      })

    // Create meal for second user
    await supertest(app.server)
      .post('/meals')
      .set('Cookie', secondUserResponse.get('Set-Cookie') ?? [])
      .send(meal)

    const response = await supertest(app.server)
      .get('/meals')
      .set('Cookie', loggedUserCookie)

    expect(response.body.meals.length).toEqual(2)
  })

  it('should be able to list a meal from an user', async () => {
    const loggedUserCookie = loggedUserResponse.get('Set-Cookie') ?? []
    const createMealResponse = await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)
      .expect(201)
    const mealId = createMealResponse.body.id

    const listMealResponse = await supertest(app.server)
      .get('/meals/' + mealId)
      .set('Cookie', loggedUserCookie)
      .expect(200)

    expect(listMealResponse.body.meal).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: meal.name,
        isWithinDiet: meal.isWithinDiet ? 1 : 0,
        dateAndTime: expect.any(String),
        created_at: expect.any(Number),
        user_id: expect.any(String),
      }),
    )
  })

  it('should be able to patch a meal from an user', async () => {
    const loggedUserCookie = loggedUserResponse.get('Set-Cookie') ?? []
    const createMealResponse = await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)
    const mealId = createMealResponse.body.id

    const patchedMeal = {
      name: 'French Fries',
    }
    await supertest(app.server)
      .patch('/meals/ ' + mealId)
      .set('Cookie', loggedUserCookie)
      .send(patchedMeal)
  })

  it('should be able to update a meal from an user', async () => {
    const loggedUserCookie = loggedUserResponse.get('Set-Cookie') ?? []
    const response = await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)
    const mealId = response.body.id

    const updatedMeal = {
      name: 'French Fries',
      dateAndTime: '2024-10-20T13:51:50.744915Z',
      isWithinDiet: false,
    }
    await supertest(app.server)
      .put('/meals/' + mealId)
      .set('Cookie', loggedUserCookie)
      .send(updatedMeal)
      .expect(200)
  })

  it('should be able to delete a meal from an user ', async () => {
    const loggedUserCookie = loggedUserResponse.get('Set-Cookie') ?? []
    const createMealResponse = await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)
    const mealId = createMealResponse.body.id

    console.log(
      await supertest(app.server)
        .delete('/meals/' + mealId)
        .set('Cookie', loggedUserCookie)
        .expect(200),
    )
  })

  it('should be able to list the metrics of the meals of an user', async () => {
    const loggedUserCookie = loggedUserResponse.get('Set-Cookie') ?? []
    const createMealResponse = await supertest(app.server)
      .post('/meals')
      .set('Cookie', loggedUserCookie)
      .send(meal)

    const listMealMetricsResponse = await supertest(app.server)
      .get('/meals/' + createMealResponse.body.user_id + '/metrics')
      .set('Cookie', loggedUserCookie)

    expect(listMealMetricsResponse.body).toEqual({
      numberOfMeals: expect.any(Number),
      mealsOutsideDiet: expect.any(Number),
      mealsWithinDiet: expect.any(Number),
      bestStreakOfMealWithinDiet: expect.any(Number),
    })
  })

  afterAll(async () => {
    await app.close()
  })
})
