"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NeucoreGroupCache_cache;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeucoreGroupCache = void 0;
const cockatiel_1 = require("cockatiel");
const in_memory_ttl_cache_1 = require("../util/in-memory-ttl-cache");
class NeucoreGroupCache {
    constructor(options) {
        _NeucoreGroupCache_cache.set(this, void 0);
        const policy = cockatiel_1.retry(cockatiel_1.handleAll, {
            backoff: new cockatiel_1.ExponentialBackoff(),
            maxAttempts: 5,
        });
        __classPrivateFieldSet(this, _NeucoreGroupCache_cache, new in_memory_ttl_cache_1.InMemoryTTLCache({
            defaultTTL: options.cacheTTL,
            get: async (characterId) => {
                console.log('getting neucore groups for', characterId);
                const groups = await policy.execute(() => options.neucoreClient.getCharacterGroups(characterId));
                return { value: groups.map(g => g.name) };
            },
        }), "f");
    }
    async getGroups(characterId, forceRefresh = false) {
        return await __classPrivateFieldGet(this, _NeucoreGroupCache_cache, "f").get(characterId, forceRefresh);
    }
}
exports.NeucoreGroupCache = NeucoreGroupCache;
_NeucoreGroupCache_cache = new WeakMap();
//# sourceMappingURL=neucore-group-cache.js.map