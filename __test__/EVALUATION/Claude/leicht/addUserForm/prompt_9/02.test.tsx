import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- render
- fireEvent
- waitFor
- setip

- doppelung keine Variable - 3
- screen

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -20
Testumfang: 75
 */

const mockSetUsers = jest.fn();
const mockUsers: User[] = [];

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    test('renders form elements correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('updates form fields on user input', async () => {
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

    test.skip('displays error for existing email', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        const { rerender } = render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'existing@example.com');

        const addButton = screen.getByRole('button', { name: /add user/i });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
        });

        rerender(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);
    });

    test('displays error for invalid password', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'weak');

        const addButton = screen.getByRole('button', { name: /add user/i });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(
                screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    test.skip('adds user successfully', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const addButton = screen.getByRole('button', { name: /add user/i });
        fireEvent.click(addButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123!',
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
