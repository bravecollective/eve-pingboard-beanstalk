"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('events', table => {
        table.increments('id', { primaryKey: true });
        table.string('system', 255).references('name').inTable('systems');
        table.string('priority', 255);
        table.string('structure', 255);
        table.string('type', 255);
        table.string('standing', 255);
        table.dateTime('event_time');
        table.string('result', 255);
        table.string('notes', 255);
        table.string('updated_by', 255);
        table.dateTime('updated_at');
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('events');
}
exports.down = down;
//# sourceMappingURL=0001-events.js.map