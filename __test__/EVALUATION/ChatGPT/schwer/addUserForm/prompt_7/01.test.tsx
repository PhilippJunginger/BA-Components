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
- critical: assertions waitFor
- critical: userEvent.setup() fehlt

- clean code: keine variablen erstellt - 3 mal
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -20
Testumfang: 51,45
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
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('shows password error messages when password is invalid', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await userEvent.type(passwordInput, 'short');

        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
            expect(
                screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it.skip('displays an error if email is already taken', async () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ];
        render(<AddUserFormSchwer users={existingUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('calls setUsers and resets form on successful user creation', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
            expect(screen.getByLabelText(/Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Password/i)).toHaveValue('');
            expect(screen.getByLabelText(/Role/i)).toHaveValue('');
        });
    });

    it.skip('navigates to user page on successful user creation if shouldRoute is true', async () => {
        mockRouter.query.shouldRoute = 'true';

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
