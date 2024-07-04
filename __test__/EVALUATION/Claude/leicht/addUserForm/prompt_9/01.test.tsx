import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render

- setup doppelung
- doppelung keine Variable - 2
- screen
- tyoeerrir

- 4 von 4 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    test('renders form fields correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('allows user input in form fields', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    test('shows department field when role is ADMIN or EMPLOYEE', async () => {
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText(/role/i);

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test('hides department field when role is CUSTOMER', async () => {
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText(/role/i);

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test.skip('displays error when email already exists', async () => {
        const user = userEvent.setup();
        const existingEmail = 'existing@example.com';
        const usersWithExistingEmail = [{ email: existingEmail }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={usersWithExistingEmail} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, existingEmail);
        await user.click(submitButton);

        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    test('displays error when password does not meet requirements', async () => {
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(passwordInput, 'weakpassword');
        await user.click(submitButton);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('successfully adds a new user when form is valid', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'ValidPass1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });
});
