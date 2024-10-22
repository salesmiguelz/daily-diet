import { app } from './app'
import { env } from './env/index'
import 'dotenv/config'

app
  .listen({
    port: env.PORT,
  })
  .then(() => {
    console.log('Server is up and running!')
  })
