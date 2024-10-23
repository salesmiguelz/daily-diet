import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { app } from '../src/app'
import supertest from 'supertest'
import { execSync } from 'child_process'

describe('User Routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('should be able to create a user', async () => {
    const user = {
      email: 'john.marston@gmail.com',
      name: 'John Marston',
    }

    const createUserResponse = await supertest(app.server)
      .post('/users')
      .send(user)

    expect(createUserResponse.body).toEqual({
      id: expect.any(String),
      email: user.email,
      name: user.name,
      session_id: null,
    })
  })

  it('should be able to log a user', async () => {
    const user = {
      email: 'john.marston@gmail.com',
      name: 'John Marston',
    }

    await supertest(app.server).post('/users').send(user)

    const response = await supertest(app.server)
      .post('/users/login')
      .send({ email: 'john.marston@gmail.com' })
      .expect(200)
    expect(response.body.sessionId).toBeTypeOf('string')
  })

  afterAll(async () => {
    await app.close()
  })
})
