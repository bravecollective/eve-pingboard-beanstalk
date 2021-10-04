"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.down = exports.up = void 0;
async function up(knex) {
    await knex.schema
        .createTable('systems', table => {
        table.string('name', 255).primary();
        table.string('constellation', 255).notNullable();
        table.string('region', 255).notNullable();
    });
}
exports.up = up;
async function down(knex) {
    await knex.schema
        .dropTable('systems');
}
exports.down = down;
//# sourceMappingURL=0000-systems.js.map