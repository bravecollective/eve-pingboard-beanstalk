"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoles = exports.getUserRolesMiddleware = exports.UserRoles = void 0;
const http_errors_1 = require("http-errors");
const common_1 = require("@ping-board/common");
Object.defineProperty(exports, "UserRoles", { enumerable: true, get: function () { return common_1.UserRoles; } });
function getUserRolesMiddleware({ neucoreToUserRolesMapping, }) {
    return (ctx, next) => {
        const neucoreGroups = (ctx.session?.character?.neucoreGroups ?? []).map(g => g.name);
        const userRoles = new Set(neucoreGroups.flatMap(g => neucoreToUserRolesMapping.get(g) ?? []));
        const roleCtx = ctx;
        roleCtx.hasRoles = (...roles) => roles.every(r => userRoles.has(r));
        roleCtx.getRoles = () => [...userRoles];
        return next();
    };
}
exports.getUserRolesMiddleware = getUserRolesMiddleware;
exports.userRoles = {
    requireOneOf: (...roles) => (ctx, next) => {
        if (roles.some(r => ctx.hasRoles(r))) {
            return next();
        }
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        throw new http_errors_1.Forbidden('insuficcient roles');
    },
    requireAllOf: (...roles) => (ctx, next) => {
        if (ctx.hasRoles(...roles)) {
            return next();
        }
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        throw new http_errors_1.Forbidden('insuficcient roles');
    },
};
//# sourceMappingURL=user-roles.js.map