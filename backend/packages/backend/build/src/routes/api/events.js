"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const http_errors_1 = require("http-errors");
const yup = __importStar(require("yup"));
const user_roles_1 = require("../../middleware/user-roles");
const extract_query_param_1 = require("../../util/extract-query-param");
function getRouter(options) {
    const router = new router_1.default();
    router.get('/', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.EVENTS_READ), async (ctx) => {
        const count = extract_query_param_1.extractQueryParam(ctx, 'count', v => {
            const n = parseInt(v, 10);
            return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null;
        });
        const before = extract_query_param_1.extractDateQueryParam(ctx, 'before');
        const after = extract_query_param_1.extractDateQueryParam(ctx, 'after');
        const [events, eventCount] = await Promise.all([
            options.events.getEvents({ before, after, count }),
            options.events.getNumberOfEvents({ before, after }),
        ]);
        const response = {
            events,
            remaining: eventCount - events.length,
        };
        ctx.body = response;
    });
    router.post('/', user_roles_1.userRoles.requireOneFreshOf(user_roles_1.UserRoles.EVENTS_EDIT, user_roles_1.UserRoles.EVENTS_ADD), async (ctx) => {
        const event = await validateEventInput(ctx.request.body);
        const response = await options.events.addEvent(event, ctx.session?.character?.name ?? '');
        ctx.body = response;
        ctx.status = 201;
    });
    router.put('/:eventId', user_roles_1.userRoles.requireOneFreshOf(user_roles_1.UserRoles.EVENTS_EDIT), async (ctx) => {
        const eventId = parseInt(ctx.params['eventId']);
        if (!Number.isFinite(eventId) || eventId < 0) {
            throw new http_errors_1.BadRequest();
        }
        const event = await validateEventInput(ctx.request.body);
        const characterName = ctx.session?.character?.name ?? '';
        const response = await options.events.setEvent(eventId, event, characterName);
        if (!response) {
            throw new http_errors_1.NotFound();
        }
        ctx.body = response;
    });
    router.delete('/:eventId', user_roles_1.userRoles.requireOneFreshOf(user_roles_1.UserRoles.EVENTS_EDIT), async (ctx) => {
        const eventId = parseInt(ctx.params['eventId']);
        if (!Number.isFinite(eventId) || eventId < 0) {
            throw new http_errors_1.BadRequest();
        }
        const success = await options.events.deleteEvent(eventId);
        if (!success) {
            throw new http_errors_1.NotFound();
        }
        ctx.status = 204;
    });
    router.get('/solarSystems', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.EVENTS_EDIT, user_roles_1.UserRoles.EVENTS_ADD), async (ctx) => {
        const solarSystems = await options.events.getSolarSystems();
        const response = { solarSystems };
        ctx.body = response;
    });
    return router;
}
exports.getRouter = getRouter;
const eventSchema = yup.object().noUnknown(true).shape({
    system: yup.string().required(),
    priority: yup.string().required(),
    structure: yup.string().required(),
    type: yup.string().required(),
    standing: yup.string().required(),
    time: yup.date().required(),
    result: yup.string().required(),
    notes: yup.string().min(0),
});
async function validateEventInput(raw) {
    const isValid = await eventSchema.isValid(raw);
    if (isValid) {
        return eventSchema.cast(raw);
    }
    throw new http_errors_1.BadRequest('invalid input');
}
//# sourceMappingURL=events.js.map