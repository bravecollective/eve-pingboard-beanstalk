"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .alterTable('pings', table => {
        table.string('slack_message_id').nullable();
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .alterTable('pings', table => {
        table.dropColumn('slack_message_id');
    });
}
exports.down = down;
//# sourceMappingURL=0008-slack-ping-message-ids.js.map