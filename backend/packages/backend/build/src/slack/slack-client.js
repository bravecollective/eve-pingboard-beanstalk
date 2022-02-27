"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slackLink = exports.SlackClient = exports.SlackRequestFailedError = exports.InvalidChannelIdError = void 0;
const web_api_1 = require("@slack/web-api");
const in_memory_ttl_cache_1 = require("../util/in-memory-ttl-cache");
class InvalidChannelIdError extends Error {
    constructor(id) {
        super(`invalid slack channel id: ${id}`);
    }
}
exports.InvalidChannelIdError = InvalidChannelIdError;
class SlackRequestFailedError extends Error {
    constructor(error) {
        super(`slack request failed: ${error || 'unknown reason'}`);
    }
}
exports.SlackRequestFailedError = SlackRequestFailedError;
class SlackClient {
    constructor(token) {
        this.channelCache = new in_memory_ttl_cache_1.InMemoryTTLCache({
            defaultTTL: 30 * 60 * 1000,
            get: async () => {
                let channels = [];
                let cursor;
                do {
                    const page = await this.client.conversations.list({
                        types: [
                            'public_channel',
                            'private_channel',
                        ].join(','),
                        exclude_archived: true,
                        cursor,
                    });
                    if (page.ok && page.channels) {
                        channels = [...channels, ...page.channels];
                    }
                    else {
                        throw new Error(`Error querying slack channels: ${page.error ?? 'unknown error'}`);
                    }
                    cursor = page.response_metadata?.next_cursor;
                } while (cursor);
                return {
                    value: channels.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '')),
                };
            },
        });
        this.channelNameCache = new in_memory_ttl_cache_1.InMemoryTTLCache({
            defaultTTL: 30 * 60 * 1000,
            maxEntries: 1000,
            get: async (channelId) => {
                const response = await this.client.conversations.info({
                    channel: channelId,
                });
                if (typeof response.channel?.name !== 'string') {
                    throw new InvalidChannelIdError(channelId);
                }
                return { value: response.channel.name };
            },
        });
        this.client = new web_api_1.WebClient(token, {
            logLevel: web_api_1.LogLevel.DEBUG,
        });
    }
    async getChannels() {
        return await this.channelCache.get();
    }
    async getChannelName(channelId) {
        return await this.channelNameCache.get(channelId);
    }
    async postMessage(channelId, text) {
        const response = await this.client.chat.postMessage({
            link_names: true,
            channel: channelId,
            text,
        });
        if (!response.ok || !response.message?.ts) {
            throw new SlackRequestFailedError(response.error);
        }
        return response.message.ts;
    }
    async deleteMessage(channelId, messageId) {
        const response = await this.client.chat.delete({
            channel: channelId,
            ts: messageId,
        });
        if (!response.ok) {
            throw new SlackRequestFailedError(response.error);
        }
    }
}
exports.SlackClient = SlackClient;
function slackLink(href, title) {
    return `<${href.replace(/\|/g, '%7C')}|${title.replace(/>/g, '\\>')}>`;
}
exports.slackLink = slackLink;
//# sourceMappingURL=slack-client.js.map