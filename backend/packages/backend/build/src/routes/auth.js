"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const http_errors_1 = require("http-errors");
const url_1 = require("url");
const neucore_1 = require("../neucore");
function getRouter(options) {
    const router = new router_1.default();
    router.get('login', '/login', async (ctx) => {
        const redirect = ctx.query.postLoginRedirect;
        const session = await ctx.resetSession({
            postLoginRedirect: extractPath(redirect),
        });
        ctx.redirect(await options.eveSsoClient.getLoginUrl(session.id));
    });
    router.post('/logout', async (ctx) => {
        await ctx.clearSession();
        ctx.status = 204;
    });
    router.get('/callback', async (ctx) => {
        const session = ctx.session;
        if (!session) {
            throw new http_errors_1.Unauthorized('missing session');
        }
        const character = await options.eveSsoClient.handleCallback(session.id, ctx.query, ctx.href);
        try {
            await ctx.resetSession({
                character: {
                    id: character.characterId,
                    name: character.name,
                },
            });
            console.log(`Successfully logged in ${character.name}`);
            ctx.redirect(extractPath(session.postLoginRedirect));
        }
        catch (error) {
            if (error instanceof neucore_1.NeucoreResponseError && error.response.status === 404) {
                ctx.body = {
                    message: 'You need to have a neucore account for this to work!',
                };
                ctx.status = 401;
            }
            else {
                throw error;
            }
        }
    });
    return router;
}
exports.getRouter = getRouter;
/**
 * Extract the path of a given URL.
 * Used for the user redirect to prevent open redirect vulnerabilities.
 *
 * @param url the URL to extract the path from
 * @param fallback the URL to use if the given url is invalid
 * @returns the path part of the URL
 */
function extractPath(url, fallback = '/') {
    return new url_1.URL((Array.isArray(url) ? url[0] : url) ?? fallback, 'ignored://ignored').pathname;
}
//# sourceMappingURL=auth.js.map