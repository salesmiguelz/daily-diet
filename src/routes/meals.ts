import { FastifyInstance } from 'fastify'

export default async (app: FastifyInstance) => {
  app.get('/', (request, reply) => {
    reply.send('Hello!')
  })
}
