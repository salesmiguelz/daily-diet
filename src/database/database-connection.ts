import { knex } from 'knex'
import config from '../../knexfile'

export const databaseConnection = knex(config.development)