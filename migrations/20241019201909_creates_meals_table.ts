import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    knex.schema.createTable('meals', (table) => {
        table.uuid('id'),
            table.text('description').notNullable(),
            table.dateTime('dateAndHour').notNullable(),
            table.boolean('isWithinDiet').notNullable()
    })
}


export async function down(knex: Knex): Promise<void> {
    knex.schema.dropTable('meals')
}

