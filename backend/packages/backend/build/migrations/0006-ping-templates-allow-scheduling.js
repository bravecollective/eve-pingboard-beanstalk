"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .alterTable('ping_templates', table => {
        table.boolean('allow_scheduling').notNullable().defaultTo(false);
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .alterTable('ping_templates', table => {
        table.dropColumn('allow_scheduling');
    });
}
exports.down = down;
//# sourceMappingURL=0006-ping-templates-allow-scheduling.js.map