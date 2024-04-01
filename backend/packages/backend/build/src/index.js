"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const database_1 = require("./database");
const neucore_1 = require("./neucore");
const eve_sso_client_1 = require("./sso/eve-sso-client");
const in_memory_session_provider_1 = require("./util/in-memory-session-provider");
const common_1 = require("@ping-board/common");
const slack_client_1 = require("./slack/slack-client");
const neucore_group_cache_1 = require("./neucore/neucore-group-cache");
async function main() {
    const eveSsoClient = new eve_sso_client_1.EveSSOClient({
        clientId: getFromEnv('SSO_CLIENT_ID'),
        clientSecret: getFromEnv('SSO_CLIENT_SECRET'),
        redirectUri: getFromEnv('SSO_REDIRECT_URI'),
        accessTokenUri: getFromEnv('SSO_TOKEN_URI'),
        authorizationUri: getFromEnv('SSO_AUTHORIZATION_URI'),
    });
    eveSsoClient.startAutoCleanup();
    const neucoreClient = new neucore_1.NeucoreClient({
        baseUrl: getFromEnv('CORE_URL'),
        appId: getFromEnv('CORE_APP_ID'),
        appToken: getFromEnv('CORE_APP_TOKEN'),
    });
    const neucoreGroupsProvider = new neucore_group_cache_1.NeucoreGroupCache({
        neucoreClient,
        cacheTTL: getNumberFromEnv('CORE_GROUP_REFRESH_INTERVAL', 60) * 1000,
    });
    const slackClient = new slack_client_1.SlackClient(getFromEnv('SLACK_TOKEN'));
    const sessionTimeout = getNumberFromEnv('SESSION_TIMEOUT', 7 * 24 * 60 * 60) * 1000;
    const sessionRefreshInterval = getNumberFromEnv('SESSION_REFRESH_INTERVAL', 60) * 1000;
    const sessionProvider = new in_memory_session_provider_1.InMemorySessionProvider();
    sessionProvider.startAutoCleanup();
    const cookieSigningKeys = process.env.COOKIE_KEY?.split(' ');
    const knex = await (0, database_1.knexInstance)();
    const events = new database_1.EventsRepository(knex);
    const pings = new database_1.PingsRepository(knex);
    if (process.env.GROUPS_WRITE_EVENTS) {
        console.warn('Using GROUPS_WRITE_EVENTS is deprecated, use GROUPS_EDIT_EVENTS instead');
    }
    const groupsByRole = [
        [common_1.UserRoles.EVENTS_READ, process.env.GROUPS_READ_EVENTS],
        [common_1.UserRoles.EVENTS_ADD, process.env.GROUPS_ADD_EVENTS],
        [common_1.UserRoles.EVENTS_EDIT, process.env.GROUPS_EDIT_EVENTS || process.env.GROUPS_WRITE_EVENTS],
        [common_1.UserRoles.PING, process.env.GROUPS_PING],
        [common_1.UserRoles.PING_TEMPLATES_WRITE, process.env.GROUPS_WRITE_PING_TEMPLATES],
    ];
    const neucoreToUserRolesMapping = groupsByRole.reduce((byGroup, [role, groups]) => (groups ?? '').split(' ')
        .reduce((byGroup, group) => byGroup.set(group, [...byGroup.get(group) ?? [], role]), byGroup), new Map());
    const app = (0, app_1.getApp)({
        eveSsoClient,
        neucoreClient,
        neucoreGroupsProvider,
        slackClient,
        sessionProvider,
        sessionTimeout,
        sessionRefreshInterval,
        cookieSigningKeys,
        events,
        pings,
        neucoreToUserRolesMapping,
    });
    const port = process.env.PORT ?? '3000';
    await new Promise((resolve, reject) => {
        const listenTimeout = 10;
        const timeout = setTimeout(() => reject(new Error(`Timed out after ${listenTimeout}s while trying to listen on port ${port}`)), listenTimeout * 1000);
        app.listen(parseInt(port), () => {
            clearTimeout(timeout);
            resolve();
        });
    });
    console.log(`Listening on port ${port}`);
}
function getFromEnv(key) {
    const value = process.env[key];
    if (typeof value !== 'string') {
        throw new Error(`Missing env variable: ${key}`);
    }
    return value;
}
function getNumberFromEnv(key, fallback) {
    const value = process.env[key];
    if (typeof value !== 'string') {
        if (typeof fallback === 'number') {
            return fallback;
        }
        throw new Error(`Missing env variable: ${key}`);
    }
    const asNumber = Number(value);
    if (!Number.isFinite(asNumber)) {
        throw new Error(`Env variable is not a number: ${key}`);
    }
    return asNumber;
}
main().catch(error => {
    console.error(error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map