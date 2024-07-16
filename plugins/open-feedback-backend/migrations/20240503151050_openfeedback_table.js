/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function up(knex) {
  return knex.schema.createTable('open_feedback', table => {
    table.increments('id').primary();
    table.string('userRef').notNullable();
    table.string('rating').notNullable();
    table.string('comment');
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function down(knex) {
  return knex.schema.dropTable('openfeedback');
};
