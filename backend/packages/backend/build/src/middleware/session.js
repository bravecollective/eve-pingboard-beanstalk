"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionMiddleware = void 0;
function getSessionMiddleware({ app, sessionCookieName, sessionProvider, }) {
    const isSigned = Array.isArray(app.keys) && app.keys.length > 0;
    if (!isSigned) {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error('Must set app.keys when running in production');
        }
        else {
            console.warn('app.keys is not set, session cookies will not be signed!');
        }
    }
    return async (ctx, next) => {
        // Alias the context to work around the readonly restrictions of the regular context
        const sessionCtx = ctx;
        sessionCtx.resetSession = async (content) => {
            const sessionId = ctx.session?.id;
            if (sessionId) {
                await sessionProvider.deleteSession(sessionId);
            }
            const sessionTimeout = 1000 * 60 * 60;
            const expiresAt = new Date(Date.now() + sessionTimeout);
            const newSession = await sessionProvider.createSession({
                expiresAt,
                ...content,
            });
            ctx.cookies.set(sessionCookieName, newSession.id, {
                httpOnly: true,
                signed: isSigned,
                overwrite: true,
                sameSite: 'lax',
                expires: expiresAt,
            });
            sessionCtx.session = newSession;
            return newSession;
        };
        sessionCtx.clearSession = async () => {
            if (ctx.session) {
                await sessionProvider.deleteSession(ctx.session.id);
                sessionCtx.session = null;
            }
            ctx.cookies.set(sessionCookieName, null);
        };
        const sessionId = ctx.cookies.get(sessionCookieName, { signed: isSigned });
        if (sessionId) {
            sessionCtx.session = await sessionProvider.getSession(sessionId) ?? null;
        }
        return next();
    };
}
exports.getSessionMiddleware = getSessionMiddleware;
//# sourceMappingURL=session.js.map