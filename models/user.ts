export enum USER_ROLE {
    CUSTOMER = 'CUSTOMER',
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}
export type User = {
    name: string;
    email: string;
    password: string;
    role: USER_ROLE;
    department?: string;
};

export type UserWithId = User & { id: string }
