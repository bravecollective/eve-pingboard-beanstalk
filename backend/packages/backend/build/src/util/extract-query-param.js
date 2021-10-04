"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractQueryParam = exports.extractDateQueryParam = void 0;
function extractDateQueryParam(ctx, name) {
    const value = extractQueryParam(ctx, name);
    if (value) {
        const date = new Date(value);
        if (!isNaN(date.getTime())) {
            return date;
        }
    }
    return null;
}
exports.extractDateQueryParam = extractDateQueryParam;
function extractQueryParam(ctx, name, map) {
    const param = ctx.query[name];
    if (typeof param === 'string') {
        if (map)
            return map(param);
        return param;
    }
    else if (Array.isArray(param) && param.length > 0) {
        if (map)
            return map(param[0]);
        return param[0];
    }
    return null;
}
exports.extractQueryParam = extractQueryParam;
//# sourceMappingURL=extract-query-param.js.map