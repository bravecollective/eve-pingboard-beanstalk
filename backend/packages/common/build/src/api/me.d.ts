import { UserRoles } from '../user-roles';
export type ApiMeResponse = {
    isLoggedIn: false;
} | {
    isLoggedIn: true;
    character: {
        id: number;
        name: string;
        roles: UserRoles[];
    };
};
//# sourceMappingURL=me.d.ts.map