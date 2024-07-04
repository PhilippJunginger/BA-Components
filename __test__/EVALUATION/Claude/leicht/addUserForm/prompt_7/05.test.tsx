import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render
- setup

- doppelung keine Variable - 3
- screen
- tyoeerrir
- unused import - 2

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -35
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    test('renders all form fields', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('allows input in all fields', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
    });

    test.skip('displays department field for non-customer roles', async () => {
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test('shows error for invalid password', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'weakpw');
        await userEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('shows error for existing email', async () => {
        const existingEmail = 'existing@example.com';
        const mockUsersWithExisting = [{ email: existingEmail }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExisting} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, existingEmail);
        await userEvent.click(submitButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('successfully adds a new user', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'ValidPass123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        const departmentInput = screen.getByLabelText(/department/i);
        await userEvent.type(departmentInput, 'HR');

        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'ValidPass123!',
                role: USER_ROLE.EMPLOYEE,
                department: 'HR',
            },
        ]);

        // Check if form is reset after submission
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test('form submission is prevented for invalid data', async () => {
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.click(submitButton);

        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('clears error messages on valid input', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        // Trigger email error
        await userEvent.type(emailInput, 'existing@example.com');
        await userEvent.click(submitButton);
        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();

        // Clear email and enter a new one
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.click(submitButton);
        expect(screen.queryByText(/Email already exists!/i)).not.toBeInTheDocument();

        // Trigger password error
        await userEvent.type(passwordInput, 'weak');
        await userEvent.click(submitButton);
        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();

        // Enter valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'ValidPass123!');
        await userEvent.click(submitButton);
        expect(screen.queryByText(/Password needs to be 8 characters long/i)).not.toBeInTheDocument();
    });
});
