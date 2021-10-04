"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('ping_templates', table => {
        table.increments('id', { primaryKey: true });
        table.string('name', 255).notNullable();
        table.string('slack_channel_name', 255).notNullable();
        table.string('slack_channel_id', 255).notNullable();
        table.text('template').notNullable();
        table.string('updated_by', 255).notNullable();
        table.dateTime('updated_at').notNullable();
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('ping_templates');
}
exports.down = down;
//# sourceMappingURL=0002-ping-templates.js.map