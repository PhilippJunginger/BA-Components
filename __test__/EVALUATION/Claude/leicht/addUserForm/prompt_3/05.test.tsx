import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- assertions waitFOr
- fireEvent
- setup


- unnecessary waitFor
- doppelung keine Variable - 4
- doppelung screen...

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -30
CleanCode: -30
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('shows department field when role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('shows error when email already exists', async () => {
        const existingUsers: User[] = [
            { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'password' },
        ];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={existingUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, 'existing@example.com');
        fireEvent.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error when password does not meet requirements', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(passwordInput, 'weak');
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'ValidPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'ValidPass1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('resets form after successful submission', async () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'ValidPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
