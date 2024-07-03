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

- clean code: keine variablen erstellt - 3 mal
- TypeError

- 5 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -20
Testumfang: 64,35
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    query: {},
});

describe('AddUserFormSchwer', () => {
    const setUsers = jest.fn();
    const users = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' }];

    beforeEach(() => {
        setUsers.mockClear();
        mockPush.mockClear();
    });

    test('renders form elements correctly', () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('displays password error messages correctly', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        });
    });

    test.skip('displays email already taken error', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('submits form and calls setUsers', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([
                ...users,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });

    test.skip('navigates to user page on successful submission if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            query: { shouldRoute: 'true' },
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    test.skip('handles server error on user creation', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
