"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemorySessionProvider = void 0;
const node_crypto_1 = __importDefault(require("node:crypto"));
const create_interval_scheduler_1 = require("./create-interval-scheduler");
class InMemorySessionProvider {
    constructor() {
        this.sessionStore = new Map();
        this.cleanupScheduler = (0, create_interval_scheduler_1.createIntervalScheduler)(() => this.cleanup());
    }
    async createSession(data) {
        const id = node_crypto_1.default.randomUUID();
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