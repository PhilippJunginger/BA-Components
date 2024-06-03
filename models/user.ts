export enum USER_ROLE {
    CUSTOMER = 'CUSTOMER',
    EMPLOYEE = 'EMPLOYEE',
    ADMIN = 'ADMIN',
}
export type User = {
    name: string;
    email: string;
    role: USER_ROLE;
    department?: string;
};
