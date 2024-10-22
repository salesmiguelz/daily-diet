import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import supertest from 'supertest'

describe('Meal Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  it('should be able to create a user', async () => {
    const user = {
      email: 'john.marston@gmail.com',
      name: 'John Marston',
    }

    await supertest(app.server).post('/user').send(user).expect(201)
  })

  it('should be able to log a user', async () => {
    const user = {
      email: 'john.marston@gmail.com',
      name: 'John Marston',
    }

    await supertest(app.server).post('/user').send(user)

    const response = await supertest(app.server)
      .post('/login')
      .send({ email: 'john.marston@gmail.com' })
      .expect(200)
    expect(response.body.sessionId).toBeTypeOf('string')
  })

  afterAll(async () => {
    await app.close()
  })
})
