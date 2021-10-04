"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsRepository = void 0;
class EventsRepository {
    constructor(knex) {
        this.knex = knex;
    }
    async getEvents(options) {
        let query = this.knex('events')
            .select('*')
            .leftJoin('systems', 'events.system', 'systems.name')
            .orderBy('event_time', options.after ? 'asc' : 'desc');
        if (options.before) {
            query = query.where('event_time', options.after ? '<=' : '<', options.before);
        }
        if (options.after) {
            query = query.where('event_time', '>', options.after);
        }
        query = query.limit(Math.min(Math.max(1, options.count ?? 40), 40));
        const events = await query;
        return events.map(rawToEvent);
    }
    async getNumberOfEvents(options) {
        let query = this.knex('events')
            .count({ count: 'id' });
        if (options.before) {
            query = query.where('event_time', options.after ? '<=' : '<', options.before);
        }
        if (options.after) {
            query = query.where('event_time', '>', options.after);
        }
        const count = await query;
        if (count.length > 0 && typeof count[0].count === 'number') {
            return count[0].count;
        }
        return 0;
    }
    async getEvent(id) {
        const event = await this.knex('events')
            .select('*')
            .leftJoin('systems', 'events.system', 'systems.name')
            .where('id', id);
        if (event.length > 0) {
            return rawToEvent(event[0]);
        }
        throw new Error('not found');
    }
    async addEvent(timer, characterName) {
        const inserted = await this.knex('events')
            .insert({
            system: timer.system,
            event_time: new Date(timer.time),
            notes: timer.notes,
            priority: timer.priority,
            result: timer.result,
            standing: timer.standing,
            structure: timer.structure,
            type: timer.type,
            updated_by: characterName,
            updated_at: new Date(),
        });
        if (inserted.length > 0) {
            return await this.getEvent(inserted[0]);
        }
        throw new Error('failed to add event');
    }
    async setEvent(id, timer, characterName) {
        const updateCount = await this.knex('events')
            .where({ id })
            .update({
            system: timer.system,
            priority: timer.priority,
            structure: timer.structure,
            type: timer.type,
            standing: timer.standing,
            event_time: new Date(timer.time),
            result: timer.result,
            notes: timer.notes,
            updated_by: characterName,
            updated_at: new Date(),
        });
        if (updateCount < 1) {
            return null;
        }
        return await this.getEvent(id);
    }
    async deleteEvent(id) {
        const deleteCount = await this.knex('events').delete().where({ id });
        return deleteCount > 0;
    }
}
exports.EventsRepository = EventsRepository;
function rawToEvent(raw) {
    return {
        id: raw.id,
        system: raw.system,
        constellation: raw.constellation ?? '',
        region: raw.region ?? '',
        priority: raw.priority ?? '',
        structure: raw.structure ?? '',
        type: raw.type ?? '',
        standing: raw.standing ?? '',
        time: raw.event_time?.toISOString() ?? '',
        result: raw.result || 'No data',
        notes: raw.notes ?? '',
        updatedAt: raw.updated_at?.toISOString() ?? '',
        updatedBy: raw.updated_by ?? '',
    };
}
//# sourceMappingURL=events-repository.js.map