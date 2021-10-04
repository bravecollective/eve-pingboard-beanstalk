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
exports.InMemorySessionProvider = void 0;
const uuid = __importStar(require("uuid"));
const create_interval_scheduler_1 = require("./create-interval-scheduler");
class InMemorySessionProvider {
    constructor() {
        this.sessionStore = new Map();
        this.cleanupScheduler = create_interval_scheduler_1.createIntervalScheduler(() => this.cleanup());
    }
    async createSession(data) {
        const id = uuid.v4();
        const session = { id, ...data };
        this.sessionStore.set(id, session);
        return session;
    }
    async updateSession(session) {
        if (!this.sessionStore.has(session.id)) {
            throw new Error('Invalid session ID');
        }
        this.sessionStore.set(session.id, session);
    }
    async getSession(sessionId) {
        const session = this.sessionStore.get(sessionId);
        if (!session || session.expiresAt.getTime() < Date.now()) {
            return null;
        }
        return session;
    }
    async deleteSession(sessionId) {
        this.sessionStore.delete(sessionId);
    }
    /**
     * Starts regularly checking for and removing expired sessions.
     * @param cleanupInterval the time between checks, in seconds
     */
    startAutoCleanup(cleanupInterval = 300) {
        this.cleanupScheduler.start(cleanupInterval * 1000);
    }
    /** Stops regularly checking for expired sessions. */
    stopAutoCleanup() {
        this.cleanupScheduler.stop();
    }
    cleanup() {
        const now = Date.now();
        for (const [sessionId, { expiresAt }] of this.sessionStore) {
            if (expiresAt.getTime() < now) {
                this.sessionStore.delete(sessionId);
            }
        }
    }
}
exports.InMemorySessionProvider = InMemorySessionProvider;
//# sourceMappingURL=in-memory-session-provider.js.map