import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from './AddUserFormLeicht';
import { USER_ROLE } from '../../models/user';

/*
- render
- watiFor

- doppelung keine Variable - 3
- tyoeerrir

- 4 von 4 notwendigem Testumfang erreicht + 1 A + 3 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const user = userEvent.setup();

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should render all form fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update form fields when user types', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show error when email already exists', async () => {
        const existingUser = { email: 'existing@example.com' };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'existing@example.com');
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error when password does not meet requirements', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should add user when form is submitted with valid data', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.CUSTOMER,
            }),
        ]);
    });

    it('should show department field for non-customer roles', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not show department field for customer role', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should clear form after successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

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
