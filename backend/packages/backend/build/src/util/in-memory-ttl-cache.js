"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryTTLCache = void 0;
class InMemoryTTLCache {
    constructor(options) {
        this.cache = new Map();
        this.defaultTTL = options.defaultTTL ?? null;
        this._get = options.get;
        this.maxEntries = options.maxEntries ?? null;
    }
    async get(key, forceRefresh = false) {
        if (forceRefresh) {
            this.cache.delete(key);
        }
        else {
            const cached = this.cache.get(key);
            if (cached) {
                const { expires, value } = await cached;
                if (expires > Date.now()) {
                    return value;
                }
            }
        }
        const newValue = (async () => {
            const { ttl, value } = await this._get(key);
            return {
                expires: Date.now() + (ttl ?? this.defaultTTL ?? 0),
                value,
            };
        })();
        this.cache.set(key, newValue);
        if (typeof this.maxEntries === 'number' && this.cache.size > Math.max(0, this.maxEntries)) {
            const oldKeys = [...this.cache.keys()].slice(0, this.cache.size - Math.max(this.maxEntries));
            for (const key of oldKeys) {
                this.cache.delete(key);
            }
        }
        return newValue.then(v => v.value);
    }
    clear() {
        this.cache.clear();
    }
}
exports.InMemoryTTLCache = InMemoryTTLCache;
//# sourceMappingURL=in-memory-ttl-cache.js.map