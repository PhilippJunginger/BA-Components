import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render
- setup
- fireEvent
- waitFOr


- doppelung keine Variable - 4
- doppelung screen... - 3
- typeerror

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 4 Redundazen


Best-Practices: -40
CleanCode: -40
Testumfang: 50
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    test.only('renders all form fields', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByText(/add user/i)).toBeInTheDocument();
    });

    test('shows department field when role is ADMIN or EMPLOYEE', async () => {
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test('validates email uniqueness', async () => {
        const existingEmail = 'existing@example.com';
        const mockUsersWithExistingEmail = [{ email: existingEmail }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExistingEmail} />);

        await userEvent.type(screen.getByLabelText(/email/i), existingEmail);
        fireEvent.submit(screen.getByRole('form'));

        expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test('validates password complexity', async () => {
        const weakPassword = 'weak';
        await userEvent.type(screen.getByLabelText(/password/i), weakPassword);
        fireEvent.submit(screen.getByRole('form'));

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test('successfully adds a new user with valid inputs', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'StrongPass1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });

    test('resets form after successful submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('form'));

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toHaveValue('');
            expect(screen.getByLabelText(/email/i)).toHaveValue('');
            expect(screen.getByLabelText(/password/i)).toHaveValue('');
            expect(screen.getByLabelText(/role/i)).toHaveValue('');
        });
    });

    test('handles input changes correctly', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass2@');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('StrongPass2@');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays department field for ADMIN and EMPLOYEE roles', async () => {
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test('clears error messages on input change', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        // Trigger email error
        await userEvent.type(emailInput, 'existing@example.com');
        fireEvent.submit(screen.getByRole('form'));
        expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();

        // Clear email error
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'new@example.com');
        expect(screen.queryByText(/email already exists/i)).not.toBeInTheDocument();

        // Trigger password error
        await userEvent.type(passwordInput, 'weak');
        fireEvent.submit(screen.getByRole('form'));
        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();

        // Clear password error
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'StrongPass3#');
        expect(screen.queryByText(/password needs to be 8 characters long/i)).not.toBeInTheDocument();
    });
});
