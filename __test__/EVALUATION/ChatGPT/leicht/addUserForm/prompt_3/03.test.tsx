import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical error: Verwendung von fireEvent
- critical error: userEvent promise not handled
- critical error: did not instantiate userEvent.setup()

- clean code: Doppelung keine variablen erstellt 2-mal

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 2 Redundanzen

Best-Practices: -30
CleanCode: -10
Testumfang: 75
 */

describe('AddUserFormLeicht Component', () => {
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    test('renders the form with initial state', () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test.skip('handles input changes', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Name/i)).toHaveValue('Jane Doe');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('jane@example.com');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('Password1!');
        expect(screen.getByLabelText(/Role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('shows error when email already exists', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test('shows password error when password is invalid', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Password/i), 'pass');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('adds a new user when form is valid', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ]);
    });

    test.skip('renders department field when role is not customer', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field when role is customer', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
