"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PingsRepository = exports.TemplateCreationError = exports.PingCreationFailedError = exports.UnknownTemplateError = void 0;
class UnknownTemplateError extends Error {
    constructor(templateId) {
        super(`could not find a template with id ${templateId}`);
    }
}
exports.UnknownTemplateError = UnknownTemplateError;
class PingCreationFailedError extends Error {
    constructor() {
        super('failed to create ping');
    }
}
exports.PingCreationFailedError = PingCreationFailedError;
class TemplateCreationError extends Error {
    constructor() {
        super('failed to create template');
    }
}
exports.TemplateCreationError = TemplateCreationError;
class PingsRepository {
    constructor(knex) {
        this.knex = knex;
    }
    async getPings(options) {
        return await this.knex.transaction(async (trx) => {
            let baseQuery = trx('pings')
                .where(builder => builder
                .where('pings.author', options.characterName)
                .orWhereIn('pings.slack_channel_id', builder => builder
                .from('ping_view_permissions')
                .select('ping_view_permissions.slack_channel_id')
                .whereIn('ping_view_permissions.neucore_group', options.neucoreGroups)));
            if (options.before) {
                baseQuery = baseQuery.where('pings.sent_at', '<', options.before);
            }
            const pingsQuery = baseQuery.clone()
                .leftJoin('scheduled_pings', 'scheduled_pings.ping_id', 'pings.id')
                .select('pings.*', 'scheduled_pings.scheduled_for', 'scheduled_pings.title')
                .orderBy('pings.sent_at', 'desc')
                .limit(100);
            const countQuery = baseQuery.clone().count({ count: 'id' });
            const [count, pings] = await Promise.all([
                countQuery,
                pingsQuery,
            ]);
            return {
                pings: pings.map(rawToPing),
                remaining: count.length > 0 && typeof count[0].count === 'number'
                    ? pings.length - count[0].count
                    : 0,
            };
        });
    }
    async getScheduledEvents(options) {
        return await this.knex.transaction(async (trx) => {
            let baseQuery = trx('scheduled_pings')
                .innerJoin('pings', 'pings.id', 'scheduled_pings.ping_id')
                .where(builder => builder
                .where('pings.author', options.characterName)
                .orWhereIn('pings.slack_channel_id', builder => builder
                .from('ping_view_permissions')
                .select('ping_view_permissions.slack_channel_id')
                .whereIn('ping_view_permissions.neucore_group', options.neucoreGroups)));
            if (options.before) {
                baseQuery = baseQuery
                    .where('scheduled_pings.scheduled_for', options.after ? '<=' : '<', options.before);
            }
            if (options.after) {
                baseQuery = baseQuery.where('scheduled_pings.scheduled_for', '>', options.after);
            }
            const countQuery = baseQuery.clone().count({ count: 'id' });
            const dataQuery = baseQuery.clone()
                .select('pings.*', 'scheduled_pings.scheduled_for', 'scheduled_pings.title')
                .limit(Math.min(Math.max(1, options.count ?? 100), 100))
                .orderBy('scheduled_pings.scheduled_for', options.after ? 'asc' : 'desc');
            const [count, data] = await Promise.all([countQuery, dataQuery]);
            return {
                pings: data.map(p => rawToPing(p)),
                remaining: (count.length > 0 && typeof count[0].count === 'number')
                    ? count[0].count - data.length
                    : 0,
            };
        });
    }
    async addPing(options) {
        return await this.knex.transaction(async (trx) => {
            const pingId = (await trx('pings').insert({
                author: options.characterName,
                sent_at: new Date(),
                slack_channel_id: options.template.slackChannelId,
                slack_channel_name: options.template.slackChannelName,
                text: options.text,
            }))[0];
            const storedPing = (await trx('pings')
                .select('pings.*', 'scheduled_pings.scheduled_for', 'scheduled_pings.title')
                .leftJoin('scheduled_pings', 'pings.id', 'scheduled_pings.ping_id')
                .where({ id: pingId }))[0];
            if (!storedPing) {
                throw new PingCreationFailedError();
            }
            if (options.template.allowScheduling && options.scheduledFor && options.scheduledTitle) {
                const date = new Date(options.scheduledFor);
                await trx('scheduled_pings').insert({
                    ping_id: pingId,
                    title: options.scheduledTitle,
                    scheduled_for: date,
                });
            }
            const apiPing = rawToPing(storedPing);
            if (options.runInTransaction) {
                await options.runInTransaction(apiPing);
            }
            return apiPing;
        });
    }
    async getPingTemplates() {
        const [templates, templateGroups] = await Promise.all([
            this.knex('ping_templates').select('*').orderBy('name', 'asc'),
            this.knex('ping_template_groups').select('*'),
        ]);
        return templates.map(t => rawToPingTemplate(t, templateGroups.filter(g => g.template_id === t.id)));
    }
    async getPingTemplate(options) {
        const knex = options.knex || this.knex;
        const template = (await knex('ping_templates')
            .select('*')
            .where({ id: options.id }))[0];
        if (!template) {
            return null;
        }
        const templateGroups = await knex('ping_template_groups')
            .select('group')
            .where({ template_id: template.id });
        return rawToPingTemplate(template, templateGroups);
    }
    async addPingTemplate(options) {
        return await this.knex.transaction(async (trx) => {
            const template = await trx('ping_templates')
                .insert({
                name: options.input.name,
                slack_channel_id: options.input.slackChannelId,
                slack_channel_name: options.input.slackChannelName,
                template: options.input.template,
                allow_scheduling: !!options.input.allowScheduling,
                updated_at: new Date(),
                updated_by: options.characterName,
            });
            if (template.length !== 1) {
                throw new TemplateCreationError();
            }
            const templateId = template[0];
            if (options.input.allowedNeucoreGroups.length > 0) {
                await trx('ping_template_groups')
                    .insert(options.input.allowedNeucoreGroups.map(group => ({
                    template_id: templateId,
                    group,
                })));
            }
            const stored = await this.getPingTemplate({ id: templateId, knex: trx });
            if (!stored) {
                throw new TemplateCreationError();
            }
            return stored;
        });
    }
    async setPingTemplate(options) {
        return await this.knex.transaction(async (trx) => {
            // Remove all previously allowed groups
            await trx('ping_template_groups')
                .delete()
                .where({ template_id: options.id });
            const updateCount = await trx('ping_templates')
                .update({
                name: options.template.name,
                slack_channel_id: options.template.slackChannelId,
                slack_channel_name: options.template.slackChannelName,
                template: options.template.template,
                allow_scheduling: !!options.template.allowScheduling,
                updated_at: new Date(),
                updated_by: options.characterName,
            })
                .where({ id: options.id });
            if (updateCount !== 1) {
                throw new UnknownTemplateError(options.id);
            }
            if (options.template.allowedNeucoreGroups.length > 0) {
                await trx('ping_template_groups')
                    .insert(options.template.allowedNeucoreGroups.map(group => ({
                    template_id: options.id,
                    group,
                })));
            }
            const stored = await this.getPingTemplate({ id: options.id, knex: trx });
            if (!stored) {
                throw new TemplateCreationError();
            }
            return stored;
        });
    }
    async deletePingTemplate(options) {
        await this.knex.transaction(async (trx) => {
            await trx('ping_template_groups')
                .delete()
                .where({ template_id: options.id });
            const deleteCount = await trx('ping_templates')
                .delete()
                .where({ id: options.id });
            if (deleteCount < 1) {
                throw new UnknownTemplateError(options.id);
            }
        });
    }
    async getPingViewPermissions() {
        const permissions = await this.knex('ping_view_permissions');
        return permissions.map(rawToPingViewPermission);
    }
    async setPingViewPermissionsByChannel(options) {
        return await this.knex.transaction(async (trx) => {
            await trx('ping_view_permissions')
                .delete()
                .where({ slack_channel_id: options.channelId });
            if (options.neucoreGroups.length > 0) {
                await trx('ping_view_permissions')
                    .insert(options.neucoreGroups.map(g => ({
                    slack_channel_id: options.channelId,
                    neucore_group: g,
                })));
            }
            return (await trx('ping_view_permissions')).map(rawToPingViewPermission);
        });
    }
    async setPingViewPermissionsByGroup(options) {
        return await this.knex.transaction(async (trx) => {
            await trx('ping_view_permissions')
                .delete()
                .where({ neucore_group: options.neucoreGroup });
            if (options.channelIds.length > 0) {
                await trx('ping_view_permissions')
                    .insert(options.channelIds.map(c => ({
                    slack_channel_id: c,
                    neucore_group: options.neucoreGroup,
                })));
            }
            return (await trx('ping_view_permissions')).map(rawToPingViewPermission);
        });
    }
}
exports.PingsRepository = PingsRepository;
function rawToPing(ping) {
    return {
        id: ping.id,
        text: ping.text,
        slackChannelId: ping.slack_channel_id,
        slackChannelName: ping.slack_channel_name,
        scheduledTitle: ping.title,
        scheduledFor: ping.scheduled_for?.toISOString(),
        author: ping.author,
        sentAt: ping.sent_at.toISOString(),
    };
}
function rawToPingTemplate(template, groups) {
    return {
        id: template.id,
        name: template.name,
        slackChannelId: template.slack_channel_id,
        slackChannelName: template.slack_channel_name,
        template: template.template,
        allowedNeucoreGroups: groups.map(g => g.group),
        allowScheduling: !!template.allow_scheduling,
        updatedAt: template.updated_at.toISOString(),
        updatedBy: template.updated_by,
    };
}
function rawToPingViewPermission(viewPermission) {
    return {
        slackChannelId: viewPermission.slack_channel_id,
        neucoreGroup: viewPermission.neucore_group,
    };
}
//# sourceMappingURL=pings-repository.js.map