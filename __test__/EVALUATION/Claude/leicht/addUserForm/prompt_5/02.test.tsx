import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- render
- fireEvent
- setup
- waitFor


- unused import
- doppelung keine Variable - 3
- doppelung screen...

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -40
CleanCode: -25
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { email: 'existing@example.com', name: 'Existing User', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders form fields correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('handles input changes correctly', async () => {
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

    test.skip('shows error for existing email', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(await screen.findByText(/email already exists/i)).toBeInTheDocument();
    });

    test('shows error for invalid password', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'weak');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('successfully adds a new user', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'Jane Doe', email: 'jane@example.com', password: 'StrongPass1!', role: USER_ROLE.CUSTOMER },
        ]);
    });

    test.skip('resets form after successful submission', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
