"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoles = exports.getUserRolesMiddleware = exports.UserRoles = void 0;
const http_errors_1 = require("http-errors");
const common_1 = require("@ping-board/common");
Object.defineProperty(exports, "UserRoles", { enumerable: true, get: function () { return common_1.UserRoles; } });
function getUserRolesMiddleware({ neucoreToUserRolesMapping, neucoreGroupsProvider, }) {
    function getUserRoles(neucoreGroups) {
        return neucoreGroups.flatMap(g => neucoreToUserRolesMapping.get(g) ?? []);
    }
    return (ctx, next) => {
        const roleCtx = ctx;
        const getGroups = async (fresh) => {
            if (!ctx.session?.character) {
                return [];
            }
            return await neucoreGroupsProvider.getGroups(ctx.session.character.id, fresh);
        };
        roleCtx.getNeucoreGroups = getGroups;
        const getRoles = async (fresh) => {
            const groups = await getGroups(fresh);
            return getUserRoles(groups);
        };
        roleCtx.hasRoles = async (...roles) => {
            const userRoles = await getRoles(false);
            return roles.every(r => userRoles.includes(r));
        };
        roleCtx.hasFreshRoles = async (...roles) => {
            const userRoles = await getRoles(true);
            return roles.every(r => userRoles.includes(r));
        };
        roleCtx.hasAnyRole = async (...roles) => {
            const userRoles = await getRoles(false);
            return roles.some(r => userRoles.includes(r));
        };
        roleCtx.hasAnyFreshRole = async (...roles) => {
            const userRoles = await getRoles(true);
            return roles.some(r => userRoles.includes(r));
        };
        roleCtx.getRoles = async () => getRoles(false);
        roleCtx.getFreshRoles = async () => getRoles(true);
        return next();
    };
}
exports.getUserRolesMiddleware = getUserRolesMiddleware;
exports.userRoles = {
    requireOneOf: (...roles) => async (ctx, next) => {
        if (await ctx.hasAnyRole(...roles)) {
            return next();
        }
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        throw new http_errors_1.Forbidden('insuficcient roles');
    },
    requireOneFreshOf: (...roles) => async (ctx, next) => {
        if (await ctx.hasAnyFreshRole(...roles)) {
            return next();
        }
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        throw new http_errors_1.Forbidden('insuficcient roles');
    },
    requireAllOf: (...roles) => async (ctx, next) => {
        if (await ctx.hasRoles(...roles)) {
            return next();
        }
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        throw new http_errors_1.Forbidden('insuficcient roles');
    },
    requireAllFreshOf: (...roles) => async (ctx, next) => {
        if (await ctx.hasFreshRoles(...roles)) {
            return next();
        }
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        throw new http_errors_1.Forbidden('insuficcient roles');
    },
};
//# sourceMappingURL=user-roles.js.map