import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: fireEvent verwendet
- critical: userEvent.setup nicht verwendet
- critical: promises not handled
- critical: assertions waitFor

- clean code: keine variablen erstellt - 2 mal

- 5 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz

Best-Practices: -40
CleanCode: -10
Testumfang: 64,35
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

describe('AddUserFormSchwer', () => {
    const setUsers = jest.fn();
    const users = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
    ];

    beforeEach(() => {
        mockRouter.mockReturnValue({
            query: {},
            push: jest.fn(),
        });
    });

    it('renders the form correctly', () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('shows password error messages when password is invalid', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        });
    });

    it.skip('displays an error if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('calls setUsers and resets form on successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/Email/i), 'new@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([
                ...users,
                { name: 'New User', email: 'new@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
            expect(screen.getByLabelText(/Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Password/i)).toHaveValue('');
            expect(screen.getByLabelText(/Role/i)).toHaveValue('');
        });
    });

    it.skip('navigates to user page on successful submission if shouldRoute is true', async () => {
        mockRouter.mockReturnValue({
            query: { shouldRoute: 'true' },
            push: jest.fn(),
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/Email/i), 'new@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it.skip('displays department field when role is not CUSTOMER', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('does not display department field when role is CUSTOMER', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
