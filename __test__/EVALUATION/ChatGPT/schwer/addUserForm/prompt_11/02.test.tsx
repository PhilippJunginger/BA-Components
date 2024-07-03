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

- clean code: keine variablen erstellt - 2 mal

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -10
Testumfang: 50,05
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

describe('AddUserFormSchwer', () => {
    const setUsers = jest.fn();
    const users = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
    ];

    beforeEach(() => {
        mockRouter.mockReturnValue({
            query: {},
            push: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
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

        await userEvent.type(screen.getByLabelText(/Name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('submits form successfully', async () => {
        const newUser = { name: 'New User', email: 'new@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), newUser.name);
        await userEvent.type(screen.getByLabelText(/Email/i), newUser.email);
        await userEvent.type(screen.getByLabelText(/Password/i), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), newUser.role);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([...users, newUser]);
        });
    });

    test.skip('navigates to user page on successful submission if shouldRoute is true', async () => {
        mockRouter.mockReturnValue({
            query: { shouldRoute: 'true' },
            push: jest.fn(),
        });

        const newUser = { name: 'New User', email: 'new@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        await userEvent.type(screen.getByLabelText(/Name/i), newUser.name);
        await userEvent.type(screen.getByLabelText(/Email/i), newUser.email);
        await userEvent.type(screen.getByLabelText(/Password/i), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), newUser.role);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
