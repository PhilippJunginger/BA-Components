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

const mockSetUsers = jest.fn();
const mockUsers: User[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
];

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(nameInput, 'Jane Smith');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');

        expect(nameInput).toHaveValue('Jane Smith');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('StrongPass1!');
    });

    it('shows department field for admin and employee roles', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('shows error when email already exists', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error when password does not meet requirements', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'Jane Smith');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'weakpass');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'Jane Smith');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'StrongPass1!' },
        ]);

        // Check if form is reset after submission
        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });

    it('adds a new admin user with department when form is submitted with valid data', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'Admin User');
        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'AdminPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const departmentInput = screen.getByLabelText('Department');
        await userEvent.type(departmentInput, 'IT');

        fireEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Admin User',
                email: 'admin@example.com',
                role: USER_ROLE.ADMIN,
                password: 'AdminPass1!',
                department: 'IT',
            },
        ]);
    });
});
