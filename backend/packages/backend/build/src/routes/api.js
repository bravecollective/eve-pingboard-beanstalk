"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const events_1 = require("./api/events");
const pings_1 = require("./api/pings");
function getRouter(options) {
    const router = new router_1.default();
    router.get('/me', ctx => {
        const response = ctx.session?.character
            ? {
                isLoggedIn: true,
                character: {
                    id: ctx.session.character.id,
                    name: ctx.session.character.name,
                    roles: ctx.getRoles(),
                },
            }
            : { isLoggedIn: false };
        ctx.body = response;
    });
    const eventsRouter = events_1.getRouter(options);
    router.use('/events', eventsRouter.routes(), eventsRouter.allowedMethods());
    const pingsRouter = pings_1.getRouter(options);
    router.use('/pings', pingsRouter.routes(), pingsRouter.allowedMethods());
    return router;
}
exports.getRouter = getRouter;
//# sourceMappingURL=api.js.map