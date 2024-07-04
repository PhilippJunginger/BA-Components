import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- waitfor
- render

- setup doppelung
- doppelung keine Variable - 3
- screen
- tyoeerrir

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
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('allows input in all fields', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('shows department field for non-customer roles', async () => {
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('displays error for invalid password', async () => {
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('displays error for existing email', async () => {
        const user = userEvent.setup();
        const existingEmail = 'existing@example.com';
        const mockUsersWithExisting = [{ email: existingEmail }];

        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExisting} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, existingEmail);
        await user.type(passwordInput, 'ValidPass1!');
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

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
    });

    it('resets form after successful submission', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
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
