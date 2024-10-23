import { app } from './app'
import { env } from './env/index'
import 'dotenv/config'

app
  .listen({
    port: env.PORT,
    host: 'RENDER' in process.env ? `0.0.0.0` : `localhost`,
  })
  .then(() => {
    console.log('Server is up and running!')
  })
