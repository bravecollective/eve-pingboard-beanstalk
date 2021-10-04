"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('scheduled_pings', table => {
        table.integer('ping_id').unsigned().primary().references('id').inTable('pings');
        table.string('title', 255);
        table.dateTime('scheduled_for').notNullable();
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('scheduled_pings');
}
exports.down = down;
//# sourceMappingURL=0007-scheduled-pings.js.map