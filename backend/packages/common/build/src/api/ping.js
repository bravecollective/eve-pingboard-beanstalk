"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScheduledPing = void 0;
function isScheduledPing(ping) {
    return typeof ping.scheduledFor === 'string' && typeof ping.scheduledTitle === 'string';
}
exports.isScheduledPing = isScheduledPing;
//# sourceMappingURL=ping.js.map