"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dayjs = void 0;
const dayjs_1 = __importDefault(require("dayjs"));
exports.dayjs = dayjs_1.default;
const duration_1 = __importDefault(require("dayjs/plugin/duration"));
const localizedFormat_1 = __importDefault(require("dayjs/plugin/localizedFormat"));
const relativeTime_1 = __importDefault(require("dayjs/plugin/relativeTime"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
dayjs_1.default.extend(duration_1.default);
dayjs_1.default.extend(localizedFormat_1.default);
dayjs_1.default.extend(relativeTime_1.default);
dayjs_1.default.extend(utc_1.default);
//# sourceMappingURL=dayjs.js.map