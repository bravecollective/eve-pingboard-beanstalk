"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApp = void 0;
const router_1 = __importDefault(require("@koa/router"));
const koa_1 = __importDefault(require("koa"));
const koa_bodyparser_1 = __importDefault(require("koa-bodyparser"));
const session_1 = require("./middleware/session");
const user_roles_1 = require("./middleware/user-roles");
const api_1 = require("./routes/api");
const auth_1 = require("./routes/auth");
function getApp(options) {
    const app = new koa_1.default();
    if (options.cookieSigningKeys && options.cookieSigningKeys.length > 0) {
        app.keys = options.cookieSigningKeys;
    }
    const appRouter = new router_1.default();
    app.use((0, session_1.getSessionMiddleware)({
        app,
        sessionCookieName: 'pingboard-session',
        sessionProvider: options.sessionProvider,
        sessionTimeout: options.sessionTimeout,
        sessionRefreshInterval: options.sessionRefreshInterval,
    }));
    app.use((0, user_roles_1.getUserRolesMiddleware)(options));
    app.use((0, koa_bodyparser_1.default)({ enableTypes: ['json'] }));
    const apiRouter = (0, api_1.getRouter)(options);
    const authRouter = (0, auth_1.getRouter)(options);
    appRouter.use('/api', apiRouter.routes(), apiRouter.allowedMethods());
    appRouter.use('/auth', authRouter.routes(), authRouter.allowedMethods());
    app.use(appRouter.routes()).use(appRouter.allowedMethods());
    return app;
}
exports.getApp = getApp;
//# sourceMappingURL=app.js.map