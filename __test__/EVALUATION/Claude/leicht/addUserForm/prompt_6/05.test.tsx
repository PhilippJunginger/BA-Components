import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render

- doppelung keine Variable - 3
- render finktion
- tyoeerrir

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme +  4 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 50
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const user = userEvent.setup();

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

    it('updates form fields when user types', async () => {
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

    it('selects a role from the dropdown', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(roleSelect).toHaveTextContent(USER_ROLE.ADMIN);
    });

    it('shows department field for non-customer roles', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('hides department field for customer role', async () => {
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('displays error for existing email', async () => {
        const emailInput = screen.getByLabelText('Email');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'existing@example.com');
        await user.click(addButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('displays error for invalid password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(passwordInput, 'weak');
        await user.click(addButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('successfully adds a new user', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'StrongPass1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));
        await user.type(screen.getByLabelText('Department'), 'IT');

        await user.click(addButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'StrongPass1!',
                role: USER_ROLE.EMPLOYEE,
                department: 'IT',
            },
        ]);
    });

    it('resets form after successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'StrongPass1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));
        await user.type(screen.getByLabelText('Department'), 'IT');

        await user.click(addButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
