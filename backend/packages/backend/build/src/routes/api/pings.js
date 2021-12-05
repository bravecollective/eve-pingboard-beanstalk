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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouter = void 0;
const router_1 = __importDefault(require("@koa/router"));
const http_errors_1 = require("http-errors");
const yup = __importStar(require("yup"));
const user_roles_1 = require("../../middleware/user-roles");
const slack_client_1 = require("../../slack/slack-client");
const dayjs_1 = require("../../util/dayjs");
const database_1 = require("../../database");
const extract_query_param_1 = require("../../util/extract-query-param");
function getRouter(options) {
    const router = new router_1.default();
    router.get('/', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING), async (ctx) => {
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        const beforeParam = ctx.query['before'];
        const before = typeof beforeParam === 'string' ? new Date(beforeParam) : undefined;
        const pings = await options.pings.getPings({
            characterName: ctx.session.character.name,
            neucoreGroups: ctx.session.character.neucoreGroups.map(g => g.name),
            before,
        });
        const response = { ...pings };
        ctx.body = response;
    });
    router.post('/', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING), async (ctx) => {
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        const ping = await validatePingInput(ctx.request.body);
        const template = await options.pings.getPingTemplate({ id: ping.templateId });
        if (!template) {
            throw new http_errors_1.BadRequest('unvalid template id');
        }
        if (!!ping.scheduledFor !== !!ping.scheduledTitle) {
            throw new http_errors_1.BadRequest('either specify both a calendar time and title or neither of both');
        }
        if (template.allowedNeucoreGroups.length > 0 &&
            !template.allowedNeucoreGroups.some(g => ctx.session?.character?.neucoreGroups.some(({ name }) => g === name))) {
            throw new http_errors_1.Forbidden('you are not permitted to ping using this template');
        }
        const placeholders = [
            { placeholder: 'me', value: ctx.session.character?.name ?? '' },
            { placeholder: 'title', value: () => ping.scheduledTitle ?? '' },
            { placeholder: 'time', value: () => {
                    if (!ping.scheduledFor) {
                        return '';
                    }
                    const time = dayjs_1.dayjs.utc(ping.scheduledFor);
                    return slack_client_1.slackLink(`https://time.nakamura-labs.com/#${time.unix()}`, `${time.format('YYYY-MM-DD HH:mm')} (${time.fromNow()})`);
                } },
        ];
        const formattedText = placeholders.reduce((text, { placeholder, value }) => text.replace(new RegExp(`{{${placeholder}}}`), () => typeof value === 'function' ? value() : value), ping.text);
        try {
            const characterName = ctx.session.character.name;
            const pingDate = new Date();
            const wrappedText = [
                '<!channel> PING',
                '\n\n',
                formattedText,
                '\n\n',
                `> ${dayjs_1.dayjs(pingDate).format('YYYY-MM-DD HH:mm:ss')} `,
                `- *${characterName}* to #${template.slackChannelId}`,
            ].join('');
            const slackMessageId = await options.slackClient.postMessage(template.slackChannelId, wrappedText);
            try {
                const p = await options.pings.addPing({
                    text: wrappedText,
                    characterName,
                    template,
                    scheduledTitle: ping.scheduledTitle,
                    scheduledFor: ping.scheduledFor,
                    slackMessageId,
                });
                ctx.status = 201;
                ctx.body = p;
            }
            catch (error) {
                // Storing the ping in the database failed, let's delete the corresponding slack message
                // and pretend we never event sent a ping in the first place.
                await options.slackClient.deleteMessage(template.slackChannelId, slackMessageId);
                throw error;
            }
        }
        catch (error) {
            if (error instanceof slack_client_1.SlackRequestFailedError) {
                throw new http_errors_1.InternalServerError(error.message);
            }
            throw error;
        }
    });
    router.get('/scheduled', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING), async (ctx) => {
        if (!ctx.session?.character) {
            throw new http_errors_1.Unauthorized();
        }
        const before = extract_query_param_1.extractDateQueryParam(ctx, 'before');
        const after = extract_query_param_1.extractDateQueryParam(ctx, 'after');
        const count = extract_query_param_1.extractQueryParam(ctx, 'count', v => {
            const n = parseInt(v, 10);
            return Number.isFinite(n) && n > 0 ? Math.ceil(n) : null;
        });
        const response = await options.pings.getScheduledEvents({
            characterName: ctx.session.character.name,
            neucoreGroups: ctx.session.character.neucoreGroups.map(g => g.name),
            before,
            after,
            count,
        });
        ctx.body = response;
    });
    router.get('/channels', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const channels = await options.slackClient.getChannels();
        const response = {
            channels: channels.flatMap(c => typeof c.id === 'string' && typeof c.name === 'string'
                ? [{ id: c.id, name: c.name }]
                : []),
        };
        ctx.body = response;
    });
    router.get('/neucore-groups', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const appInfo = await options.neucoreClient.getAppInfo();
        const response = {
            neucoreGroups: appInfo.groups,
        };
        ctx.body = response;
    });
    router.get('/templates', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING), async (ctx) => {
        const templates = await options.pings.getPingTemplates();
        const canSeeAllTemplates = ctx.hasRoles(user_roles_1.UserRoles.PING_TEMPLATES_WRITE);
        let response;
        if (canSeeAllTemplates) {
            response = { templates };
        }
        else {
            const neucoreGroups = ctx.session?.character?.neucoreGroups?.map(g => g.name) ?? [];
            response = {
                templates: templates.filter(t => t.allowedNeucoreGroups.length === 0 ||
                    t.allowedNeucoreGroups.some(g => neucoreGroups.includes(g))),
            };
        }
        ctx.body = response;
    });
    router.post('/templates', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const template = await validateTemplateInput(ctx.request.body);
        const channelName = await options.slackClient.getChannelName(template.slackChannelId);
        const createdTemplate = await options.pings.addPingTemplate({
            input: {
                ...template,
                slackChannelName: channelName,
            },
            characterName: ctx.session?.character?.name ?? '',
        });
        ctx.body = createdTemplate;
    });
    router.put('/templates/:templateId', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const templateId = parseInt(ctx.params['templateId'] ?? '', 10);
        if (!isFinite(templateId)) {
            throw new http_errors_1.BadRequest(`invalid templateId: ${ctx.params['templateId']}`);
        }
        const template = await validateTemplateInput(ctx.request.body);
        const channelName = await options.slackClient.getChannelName(template.slackChannelId);
        try {
            const updatedTemplate = await options.pings.setPingTemplate({
                id: templateId,
                template: {
                    ...template,
                    slackChannelName: channelName,
                },
                characterName: ctx.session?.character?.name ?? '',
            });
            ctx.body = updatedTemplate;
        }
        catch (e) {
            if (e instanceof database_1.UnknownTemplateError) {
                throw new http_errors_1.NotFound();
            }
            throw e;
        }
    });
    router.delete('/templates/:templateId', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const templateId = parseInt(ctx.params['templateId'] ?? '', 10);
        if (!isFinite(templateId)) {
            throw new http_errors_1.BadRequest(`invalid templateId: ${ctx.params['templateId']}`);
        }
        try {
            await options.pings.deletePingTemplate({ id: templateId });
            ctx.status = 204;
        }
        catch (e) {
            if (e instanceof database_1.UnknownTemplateError) {
                throw new http_errors_1.NotFound();
            }
            throw e;
        }
    });
    router.get('/view-permissions', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const [viewPermissions, slackChannels] = await Promise.all([
            options.pings.getPingViewPermissions(),
            options.slackClient.getChannels(),
        ]);
        const response = buildApiPingViewPermissionsResponse(viewPermissions, slackChannels);
        ctx.body = response;
    });
    router.put('/view-permissions/groups/:group', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const neucoreGroup = ctx.params['group'];
        if (!neucoreGroup) {
            throw new http_errors_1.BadRequest('invalid neucore group');
        }
        const appInfo = await options.neucoreClient.getAppInfo();
        if (!appInfo.groups.some(g => g.name === neucoreGroup)) {
            throw new http_errors_1.BadRequest('invalid neucore group');
        }
        const input = await validateViewPermissionsByGroupInput(ctx.request.body);
        const slackChannels = await options.slackClient.getChannels();
        const invalidSlackChannels = input.allowedSlackChannelIds
            .filter(c => !slackChannels.some(sc => sc.id === c));
        if (invalidSlackChannels.length > 0) {
            throw new http_errors_1.BadRequest(`invalid slack channel id: ${invalidSlackChannels.join(', ')}`);
        }
        const viewPermissions = await options.pings.setPingViewPermissionsByGroup({
            neucoreGroup,
            channelIds: input.allowedSlackChannelIds,
        });
        const response = buildApiPingViewPermissionsResponse(viewPermissions, slackChannels);
        ctx.body = response;
    });
    router.put('/view-permissions/channels/:channelId', user_roles_1.userRoles.requireOneOf(user_roles_1.UserRoles.PING_TEMPLATES_WRITE), async (ctx) => {
        const channelId = ctx.params['channelId'];
        if (!channelId) {
            throw new http_errors_1.BadRequest('invalid slack channel id');
        }
        const slackChannels = await options.slackClient.getChannels();
        if (!slackChannels.some(c => c.id === channelId)) {
            throw new http_errors_1.BadRequest('invalid slack channel id');
        }
        const input = await validateViewPermissionsByChannelInput(ctx.request.body);
        const appInfo = await options.neucoreClient.getAppInfo();
        const invalidNeucoreGroups = input.allowedNeucoreGroups
            .filter(g => !appInfo.groups.some(ng => ng.name === g));
        if (invalidNeucoreGroups.length > 0) {
            throw new http_errors_1.BadRequest(`invalid neucore group: ${invalidNeucoreGroups.join(', ')}`);
        }
        const viewPermissions = await options.pings.setPingViewPermissionsByChannel({
            channelId,
            neucoreGroups: input.allowedNeucoreGroups,
        });
        const response = buildApiPingViewPermissionsResponse(viewPermissions, slackChannels);
        ctx.body = response;
    });
    return router;
}
exports.getRouter = getRouter;
const pingSchema = yup.object().noUnknown(true).shape({
    templateId: yup.number().required(),
    text: yup.string().min(1),
    scheduledTitle: yup.string().min(1).notRequired(),
    scheduledFor: yup.date().notRequired(),
});
async function validatePingInput(raw) {
    const isValid = await pingSchema.isValid(raw);
    if (isValid) {
        return pingSchema.cast(raw);
    }
    throw new http_errors_1.BadRequest('invalid input');
}
const templateSchema = yup.object().noUnknown(true).shape({
    name: yup.string().required().min(1),
    slackChannelId: yup.string().min(1),
    template: yup.string().min(0),
    allowedNeucoreGroups: yup.array(yup.string().min(1)).min(0),
    allowScheduling: yup.boolean().notRequired(),
});
async function validateTemplateInput(raw) {
    const isValid = await templateSchema.isValid(raw);
    if (isValid) {
        return templateSchema.cast(raw);
    }
    throw new http_errors_1.BadRequest('invalid input');
}
const viewPermissionsByGroupSchema = yup.object().noUnknown(true).shape({
    allowedSlackChannelIds: yup.array(yup.string().min(1)).min(0),
});
async function validateViewPermissionsByGroupInput(raw) {
    if (await viewPermissionsByGroupSchema.isValid(raw)) {
        return viewPermissionsByGroupSchema.cast(raw);
    }
    throw new http_errors_1.BadRequest('invalid input');
}
const viewPermissionsByChannelSchema = yup.object().noUnknown(true).shape({
    allowedNeucoreGroups: yup.array(yup.string().min(1)).min(0),
});
async function validateViewPermissionsByChannelInput(raw) {
    if (await viewPermissionsByChannelSchema.isValid(raw)) {
        return viewPermissionsByChannelSchema
            .cast(raw);
    }
    throw new http_errors_1.BadRequest('invalid input');
}
function buildApiPingViewPermissionsResponse(dbResult, slackChannels) {
    return {
        viewPermissions: dbResult.map(p => ({
            ...p,
            slackChannelName: slackChannels.find(c => c.id === p.slackChannelId)?.name ?? '',
        })),
    };
}
//# sourceMappingURL=pings.js.map