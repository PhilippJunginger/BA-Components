import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render
- setup
- fireEvent

- doppelung keine Variable - 3
- screen
- tyoeerrir

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme +  2 Redundazen


Best-Practices: -30
CleanCode: -30
Testumfang: 75
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

    test('validates password complexity', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'weakpassword');
        fireEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('checks for existing email', async () => {
        const existingEmail = 'existing@example.com';
        const mockUsersWithExisting = [{ email: existingEmail }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExisting} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, existingEmail);
        fireEvent.click(submitButton);

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
        await userEvent.type(passwordInput, 'ValidPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
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

    test.skip('adds department for non-customer roles', async () => {
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Admin User');
        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'AdminPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const departmentInput = screen.getByLabelText(/department/i);
        await userEvent.type(departmentInput, 'IT');

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'Admin User',
                    email: 'admin@example.com',
                    password: 'AdminPass1!',
                    role: USER_ROLE.ADMIN,
                    department: 'IT',
                },
            ]);
        });
    });
});
