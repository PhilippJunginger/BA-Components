import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- waitfor
- render

- doppelung keine Variable - 3
- screen

- 4 von 4 notwendigem Testumfang erreicht +  3 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 62,5
 */

const mockSetUsers = jest.fn();

const initialUsers: User[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
];

describe('AddUserFormLeicht', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
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

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'StrongPass1!');

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('StrongPass1!');
    });

    it('should show error when email already exists', async () => {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'john@example.com');

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error when password is invalid', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'weak');

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should add new user when form is submitted with valid data', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'StrongPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'StrongPass1!' },
        ]);
    });

    it('should show department field for non-customer roles', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should reset form after successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'StrongPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
