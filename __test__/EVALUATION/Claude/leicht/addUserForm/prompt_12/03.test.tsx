import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- waitFor
- render

- screen
- doppelung keine Variable - 3
- screen
- typeerror

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -30
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders all form fields', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
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

    it.skip('shows department field for admin and employee roles', async () => {
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText(/role/i);

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('shows error when email already exists', async () => {
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        const existingEmail = 'existing@example.com';
        const mockUsersWithExistingEmail = [{ email: existingEmail }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExistingEmail} />);

        await user.type(emailInput, existingEmail);
        await user.click(submitButton);

        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    it('shows error when password does not meet requirements', async () => {
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('adds a new user when form is submitted with valid data', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
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
    });

    it.skip('resets form after successful submission', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
