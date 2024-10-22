import { FastifyReply, FastifyRequest } from 'fastify'

export default async (request: FastifyRequest, reply: FastifyReply) => {
  const sessionId = request.cookies.sessionId
  if (!sessionId) {
    reply.status(401).send({
      error: 'User must be logged to perform this action!',
    })
  }
}
