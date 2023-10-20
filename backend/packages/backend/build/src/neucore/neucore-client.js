"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NeucoreClient = exports.NeucoreResponseError = exports.NeucoreError = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
/**
 * Thrown when there was an issue getting a response from Neucore.
 */
class NeucoreError extends Error {
    constructor(message, underlyingError) {
        super(message);
        this.underlyingError = underlyingError;
    }
}
exports.NeucoreError = NeucoreError;
/**
 * Thrown when the request to Neucore returned a non-success status code (≥ 400).
 */
class NeucoreResponseError extends NeucoreError {
    constructor(message, path, response, underlyingError) {
        super(message + ` (while fetching ${path})`, underlyingError);
        this.response = response;
    }
}
exports.NeucoreResponseError = NeucoreResponseError;
class NeucoreClient {
    constructor({ baseUrl, appId, appToken }) {
        // Strip trailing slashes off the baseUrl, just in case
        this.baseUrl = baseUrl.replace(/[/]+$/g, '');
        const bearerToken = Buffer.from(`${appId}:${appToken}`).toString('base64');
        this.authHeaders = {
            authorization: `Bearer ${bearerToken}`,
        };
    }
    /** Performs a GET request to Neucore */
    async get(path) {
        let response;
        const url = `${this.baseUrl}${path}`;
        try {
            response = await (0, node_fetch_1.default)(url, {
                headers: this.authHeaders,
            });
        }
        catch (error) {
            throw new NeucoreError(`Request failed (GET ${url})`, error instanceof Error ? error : new Error(String(error)));
        }
        if (response.status < 400) {
            try {
                return (await response.json());
            }
            catch (error) {
                throw new NeucoreResponseError('Failed to parse response', path, response, error instanceof Error ? error : new Error(String(error)));
            }
        }
        throw new NeucoreResponseError(`Received unexpected status code: ${response.status}`, path, response);
    }
    /**
     * Queries the character's user's groups from Neucore.
     * Throws a NeucoreResponseError with status code 404 if neucore does not know the character.
     */
    async getCharacterGroups(characterId) {
        return this.get(`/app/v2/groups/${characterId}`);
    }
    async getAppInfo() {
        return this.get('/app/v1/show');
    }
}
exports.NeucoreClient = NeucoreClient;
//# sourceMappingURL=neucore-client.js.map