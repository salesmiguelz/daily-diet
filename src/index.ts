import fastify from 'fastify'
import mealsRoutes from './routes/meals'

const app = fastify()

app.register(mealsRoutes, {
  prefix: 'meals',
})
app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('Server is up and running!')
  })
