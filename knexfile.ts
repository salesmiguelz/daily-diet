export default {
  client: 'sqlite3',
  connection: {
    filename: './database/dev.db',
  },
  useNullAsDefault: true,
  migrations: {
    directory: './src/migrations',
  },
}
