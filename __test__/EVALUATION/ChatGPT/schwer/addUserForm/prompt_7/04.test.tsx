import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: Promises not handled
- critical: userEvent.setup() fehlt
- critical: assertions waitFor

- clean code: keine variablen erstellt - 3 mal
- clean code: Doppelung screen....
- TypeError

- 5 von 7 notwendigen Testumfang erreicht + 1 Ausnahme  + 1 Redundanz


Best-Practices: -40
CleanCode: -25
Testumfang: 64,35
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockRouterPush = jest.fn();
    const mockRouter = {
        query: {},
        push: mockRouterPush,
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('displays password error messages correctly', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
            expect(
                screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        });
    });

    it('displays error when email is already taken', async () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ];
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={existingUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('calls setUsers and resets form on successful user creation', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
        });
    });

    it('navigates to user page on successful user creation if shouldRoute is true', async () => {
        mockRouter.query.shouldRoute = 'true';
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it('displays department field when role is not CUSTOMER', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not display department field when role is CUSTOMER', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
