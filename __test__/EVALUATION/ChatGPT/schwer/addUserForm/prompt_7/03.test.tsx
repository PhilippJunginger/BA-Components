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

- clean code: keine variablen erstellt
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -10
Testumfang: 50,05
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

    test('renders form fields correctly', () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('displays password error messages correctly', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
            expect(
                screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    test.skip('displays error when email is already taken', async () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ];
        render(<AddUserFormSchwer users={existingUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('submits form successfully and redirects', async () => {
        const newUser = { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' };
        const mockFetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        );
        global.fetch = mockFetch;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), newUser.name);
        await userEvent.type(screen.getByLabelText(/Email/i), newUser.email);
        await userEvent.type(screen.getByLabelText(/Password/i), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), newUser.role);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([newUser]);
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    test.skip('handles server error correctly', async () => {
        const newUser = { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' };
        const mockFetch = jest.fn(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({ message: 'Internal Server Error' }),
            }),
        );
        global.fetch = mockFetch;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), newUser.name);
        await userEvent.type(screen.getByLabelText(/Email/i), newUser.email);
        await userEvent.type(screen.getByLabelText(/Password/i), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), newUser.role);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
