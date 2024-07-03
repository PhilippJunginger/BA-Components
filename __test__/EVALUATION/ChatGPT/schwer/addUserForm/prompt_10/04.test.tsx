import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: fireEvent verwendet
- critical: assertions waitFor

- clean code: keine variablen erstellt - 3 mal
- unnötige waitFor - 2 mal
- render Funktion

- 3 von 7 notwendigen Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 28,6
*/

describe('AddUserFormSchwer Component', () => {
    const setup = () => {
        const setUsers = jest.fn();
        const users: User[] = [];

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
        return { setUsers, users };
    };

    it('renders form elements correctly', () => {
        setup();

        expect(screen.getByText(/Create new User/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('handles input changes', async () => {
        setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password1!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password1!');
    });

    it('displays password validation errors', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(passwordInput, 'pass');
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

    it('submits the form with valid data', async () => {
        const { setUsers, users } = setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.click(submitButton);

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([
                ...users,
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password1!',
                    role: USER_ROLE.ADMIN,
                },
            ]);
        });
    });

    it('displays error when email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'Password1!',
            role: USER_ROLE.ADMIN,
        };
        const setUsers = jest.fn();
        const users: User[] = [existingUser];
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'existing@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
