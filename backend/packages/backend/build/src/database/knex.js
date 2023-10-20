"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.knexInstance = void 0;
const knex_1 = __importDefault(require("knex"));
let instance = null;
async function knexInstance() {
    if (!instance) {
        instance = (0, knex_1.default)({
            client: 'mysql2',
            connection: process.env.DB_URL,
            pool: {
                min: 2,
                max: 10,
            },
        });
        for (let tries = 1;; tries++) {
            try {
                await instance.raw('SET @@session.time_zone = "UTC"');
                break;
            }
            catch (error) {
                if (tries > 9) {
                    throw error;
                }
                console.warn('Failed to connect to database, retrying in 5 seconds...', error);
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
    }
    return instance;
}
exports.knexInstance = knexInstance;
//# sourceMappingURL=knex.js.map