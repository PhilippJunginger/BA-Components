import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render
- setup

- doppelung keine Variable - 3
- screen 3
- tyoeerrir
- unused import - 2

- 4 von 4 notwendigem Testumfang erreicht + 5 Redundazen


Best-Practices: -20
CleanCode: -45
Testumfang: 37.5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders all form fields', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('displays department field when role is ADMIN or EMPLOYEE', async () => {
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test.skip('submits form with valid data', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.CUSTOMER,
            }),
        ]);
    });

    test.skip('displays error for existing email', async () => {
        const existingUser = { email: 'existing@example.com' };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test('displays error for invalid password', async () => {
        await userEvent.type(screen.getByLabelText(/password/i), 'weak');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('clears form after successful submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });

    test.skip('validates all required fields', async () => {
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByLabelText(/name/i)).toBeInvalid();
        expect(screen.getByLabelText(/email/i)).toBeInvalid();
        expect(screen.getByLabelText(/password/i)).toBeInvalid();
        expect(screen.getByLabelText(/role/i)).toBeInvalid();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('handles input changes correctly', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('StrongPass1!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('displays and hides password requirements', async () => {
        const passwordInput = screen.getByLabelText(/password/i);

        // Initially, password requirements should not be visible
        expect(screen.queryByText(/password needs to be 8 characters long/i)).not.toBeInTheDocument();

        // Type an invalid password
        await userEvent.type(passwordInput, 'weak');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        // Password requirements should now be visible
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();

        // Type a valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        // Password requirements should be hidden again
        expect(screen.queryByText(/password needs to be 8 characters long/i)).not.toBeInTheDocument();
    });
});
