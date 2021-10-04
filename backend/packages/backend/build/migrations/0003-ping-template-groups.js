"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('ping_template_groups', table => {
        table.integer('template_id').unsigned().references('id').inTable('ping_templates');
        table.string('group');
        table.primary(['template_id', 'group']);
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('ping_template_groups');
}
exports.down = down;
//# sourceMappingURL=0003-ping-template-groups.js.map