export interface ApiPingInput {
    templateId: number;
    text: string;
    scheduledTitle?: string;
    scheduledFor?: string;
}
export interface ApiPing {
    id: number;
    text: string;
    slackChannelName: string;
    slackChannelId: string;
    slackMessageId?: string | null;
    scheduledTitle?: string;
    scheduledFor?: string;
    author: string;
    sentAt: string;
}
export interface ApiPingsResponse {
    pings: ApiPing[];
    remaining: number;
}
export declare type ApiScheduledPing = Omit<ApiPing, 'scheduledTitle' | 'scheduledFor'> & Required<Pick<ApiPing, 'scheduledTitle' | 'scheduledFor'>>;
export declare function isScheduledPing(ping: ApiPing): ping is ApiScheduledPing;
export interface ApiScheduledPingsResponse {
    pings: ApiScheduledPing[];
    remaining: number;
}
//# sourceMappingURL=ping.d.ts.map