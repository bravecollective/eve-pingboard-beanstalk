"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createIntervalScheduler = void 0;
function createIntervalScheduler(callback) {
    let interval = null;
    function stop() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }
    function start(int, runImmediately = false) {
        stop();
        interval = setInterval(callback, int);
        if (runImmediately) {
            callback();
        }
    }
    return { start, stop };
}
exports.createIntervalScheduler = createIntervalScheduler;
//# sourceMappingURL=create-interval-scheduler.js.map