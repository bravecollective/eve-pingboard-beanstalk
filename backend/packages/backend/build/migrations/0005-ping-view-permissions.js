"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('ping_view_permissions', table => {
        table.string('neucore_group', 255);
        table.string('slack_channel_id', 255);
        table.primary(['neucore_group', 'slack_channel_id']);
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('ping_view_permissions');
}
exports.down = down;
//# sourceMappingURL=0005-ping-view-permissions.js.map