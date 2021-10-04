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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseEveJWT = void 0;
const jwt = __importStar(require("jsonwebtoken"));
function parseEveJWT(token, clientId) {
    const parsed = jwt.decode(token, { json: true });
    if (!parsed) {
        throw new Error('invalid Eve JWT');
    }
    if (typeof parsed.jti !== 'string' ||
        typeof parsed.name !== 'string' ||
        typeof parsed.sub !== 'string' ||
        typeof parsed.owner !== 'string' ||
        typeof parsed.exp !== 'number' ||
        parsed.azp !== clientId ||
        parsed.iss !== 'login.eveonline.com') {
        throw new Error('invalid Eve JWT');
    }
    const scopes = 'scp' in parsed
        ? Array.isArray(parsed.scp)
            ? parsed.scp.filter((s) => typeof s === 'string')
            : typeof parsed.scp === 'string'
                ? [parsed.scp]
                : []
        : [];
    const characterIdStr = parsed.sub.match(/^CHARACTER:EVE:(\d+)$/);
    if (!characterIdStr) {
        throw new Error('invalid Eve JWT');
    }
    const characterId = parseInt(characterIdStr[1]);
    if (!Number.isFinite(characterId)) {
        throw new Error('invalid Eve JWT');
    }
    return {
        token,
        scopes,
        jti: parsed.jti,
        characterId,
        name: parsed.name,
        owner: parsed.owner,
        expiresAt: new Date(parsed.exp * 1000),
    };
}
exports.parseEveJWT = parseEveJWT;
//# sourceMappingURL=eve-jwt.js.map