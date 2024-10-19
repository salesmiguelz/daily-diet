import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  knex.schema.createTable('meals', (table) => {
    table.uuid('id').primary()
    table.text('name').notNullable()
    table.dateTime('dateAndTime').notNullable()
    table.boolean('isWithinDiet')
  })
}

export async function down(knex: Knex): Promise<void> {
  knex.schema.dropTable('meals')
}
