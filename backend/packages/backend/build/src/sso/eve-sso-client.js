"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EveSSOClient = void 0;
const client_oauth2_1 = __importDefault(require("client-oauth2"));
const node_crypto_1 = __importDefault(require("node:crypto"));
const eve_jwt_1 = require("./eve-jwt");
const http_errors_1 = require("http-errors");
const create_interval_scheduler_1 = require("../util/create-interval-scheduler");
/**
 * Takes care of interacting with EVE SSO.
 * https://docs.esi.evetech.net/docs/sso/
 */
class EveSSOClient {
    constructor(options) {
        this.loginStates = new Map();
        this.clientId = options.clientId;
        this.client = new client_oauth2_1.default({
            clientId: options.clientId,
            clientSecret: options.clientSecret,
            redirectUri: options.redirectUri,
            accessTokenUri: options.accessTokenUri ?? 'https://login.eveonline.com/v2/oauth/token',
            authorizationUri: options.authorizationUri ?? 'https://login.eveonline.com/v2/oauth/authorize',
        });
        this.stateTimeout = options.stateTimeout ?? 300;
        this.cleanupScheduler = (0, create_interval_scheduler_1.createIntervalScheduler)(() => this.cleanupStates());
    }
    /**
     * Starts regularly checking for and removing expired login states.
     * @param cleanupInterval the time between checks, in seconds
     */
    startAutoCleanup(cleanupInterval = this.stateTimeout) {
        this.cleanupScheduler.start(cleanupInterval * 1000);
    }
    /**
     * Stops any previously started automatic cleanup of login states.
     */
    stopAutoCleanup() {
        this.cleanupScheduler.stop();
    }
    /** Removes all expired login states. */
    cleanupStates() {
        const expirationTime = Date.now() - (this.stateTimeout * 1000);
        for (const [state, { createdAt }] of this.loginStates) {
            if (createdAt >= expirationTime) {
                this.loginStates.delete(state);
            }
        }
    }
    /**
     * Builds a login URL a user can be redirected to to log them in using EVE SSO.
     *
     * @param sessionId the sessionId to associate the login with
     */
    async getLoginUrl(sessionId) {
        const state = node_crypto_1.default.randomUUID();
        const redirectUri = await this.client.code.getUri({ state });
        this.loginStates.set(state, {
            sessionId,
            createdAt: Date.now(),
        });
        return redirectUri;
    }
    /**
     * Performs the OAuth2.0 token exchange with the EVE SSO server.
     * Should be called when the user was redirected back to the application.
     * @param sessionId the sessionId associated with the callback request
     * @param query the parsed query of the callback request
     * @param href the full href of the callback request
     * @returns the parsed access token obtained using the token exchange
     */
    async handleCallback(sessionId, query, href) {
        // Verify the state belongs to the active session.
        // Helps preventing CSRF attacks.
        let state = query['state'];
        if (!state) {
            throw new http_errors_1.BadRequest('missing state');
        }
        if (Array.isArray(state)) {
            state = state[0];
        }
        const stateData = this.loginStates.get(state);
        this.loginStates.delete(state);
        if (stateData?.sessionId !== sessionId) {
            throw new http_errors_1.BadRequest('invalid state');
        }
        // Obtain the actual access token from EVE SSO
        const tokens = await this.client.code.getToken(href);
        const accessToken = (0, eve_jwt_1.parseEveJWT)(tokens.accessToken, this.clientId);
        return accessToken;
    }
}
exports.EveSSOClient = EveSSOClient;
//# sourceMappingURL=eve-sso-client.js.map