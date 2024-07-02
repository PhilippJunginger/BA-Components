import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical error: userEvent promise not handled
- critical error: did not instantiate userEvent.setup()

- minor: unused import
- Doppelung keine Variable erstellt

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 2 Redundanzen

Best-Practices: -20
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

    test.skip('displays error for existing email', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test('displays error for invalid password', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Password/i), 'invalid');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('adds a new user successfully', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ]);
    });

    test.skip('displays department field for non-customer roles', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not display department field for customer role', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
