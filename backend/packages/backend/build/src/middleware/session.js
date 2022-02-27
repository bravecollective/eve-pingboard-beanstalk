"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionMiddleware = void 0;
function getSessionMiddleware({ app, sessionCookieName, sessionProvider, sessionTimeout, sessionRefreshInterval, }) {
    const isSigned = Array.isArray(app.keys) && app.keys.length > 0;
    if (!isSigned) {
        if (process.env.NODE_ENV !== 'development') {
            throw new Error('Must set app.keys when running in production');
        }
        else {
            console.warn('app.keys is not set, session cookies will not be signed!');
        }
    }
    const getCookieOptions = () => ({
        httpOnly: true,
        signed: isSigned,
        overwrite: true,
        sameSite: 'lax',
        expires: new Date(Date.now() + sessionTimeout),
    });
    return async (ctx, next) => {
        // Alias the context to work around the readonly restrictions of the regular context
        const sessionCtx = ctx;
        sessionCtx.resetSession = async (content) => {
            const sessionId = ctx.session?.id;
            if (sessionId) {
                await sessionProvider.deleteSession(sessionId);
            }
            const cookieOptions = getCookieOptions();
            const newSession = await sessionProvider.createSession({
                expiresAt: cookieOptions.expires,
                ...content,
            });
            ctx.cookies.set(sessionCookieName, newSession.id, cookieOptions);
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
            const session = await sessionProvider.getSession(sessionId) ?? null;
            sessionCtx.session = session;
            if (session) {
                const sessionAge = Date.now() + sessionTimeout - session.expiresAt.getTime();
                const shouldRefresh = sessionRefreshInterval >= 0 &&
                    sessionAge >= sessionRefreshInterval;
                if (shouldRefresh) {
                    const cookieOptions = getCookieOptions();
                    await sessionProvider.updateSession({
                        ...session,
                        expiresAt: cookieOptions.expires,
                    });
                    ctx.cookies.set(sessionCookieName, sessionId, cookieOptions);
                }
            }
            else {
                // The session wasn't found in the database, so there's no point in keeping the cookie
                ctx.cookies.set(sessionCookieName, null);
            }
        }
        return next();
    };
}
exports.getSessionMiddleware = getSessionMiddleware;
//# sourceMappingURL=session.js.map