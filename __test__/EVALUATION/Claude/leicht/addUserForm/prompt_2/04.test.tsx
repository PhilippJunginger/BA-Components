import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render in boefereach


- setup doppelungen
- unnecessary waitFor
- doppelung keine Variable - 3
- doppelung screen...
- type error
- unused import

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -40
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders the form with all required fields', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        const user = userEvent.setup();
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

    it('shows department field when role is ADMIN or EMPLOYEE', async () => {
        const user = userEvent.setup();
        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('shows error when email already exists', async () => {
        const user = userEvent.setup();
        const emailInput = screen.getByLabelText('Email');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'existing@example.com');

        const mockUsersWithExistingEmail = [{ email: 'existing@example.com' }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExistingEmail} />);

        await user.click(addButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('shows error when password does not meet requirements', async () => {
        const user = userEvent.setup();
        const passwordInput = screen.getByLabelText('Password');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(passwordInput, 'weak');
        await user.click(addButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(addButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'ValidPass1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('resets form after successful submission', async () => {
        const user = userEvent.setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(addButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });
});
