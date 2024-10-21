import fastify from 'fastify'
import mealsRoutes from './routes/meals'
import usersRoutes from './routes/users'
import cookie from '@fastify/cookie'

const app = fastify()
app.register(cookie)
app.register(mealsRoutes, {
  prefix: 'meals',
})

app.register(usersRoutes, {
  prefix: 'users',
})
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server is up and running!')
  })
