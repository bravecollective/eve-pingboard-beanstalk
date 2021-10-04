"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('pings', table => {
        table.increments('id', { primaryKey: true });
        table.text('text').notNullable();
        table.string('slack_channel_name', 255).notNullable();
        table.string('slack_channel_id', 255).notNullable();
        table.string('author', 255).notNullable();
        table.dateTime('sent_at').notNullable();
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('pings');
}
exports.down = down;
//# sourceMappingURL=0004-pings.js.map