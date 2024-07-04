import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- fireEvent
- userEvent.setup missing
- assertions waitFOr

- doppelung keine Variable - 3
- doppelung screen...

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -30
CleanCode: -20
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

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(screen.getByLabelText('Name'), 'John Duplicate');
        await userEvent.type(screen.getByLabelText('Password'), 'ValidPass1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error when password is invalid', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(screen.getByLabelText('Name'), 'Valid Name');
        await userEvent.type(screen.getByLabelText('Email'), 'valid@example.com');
        await userEvent.type(passwordInput, 'weak');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'ValidPass1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Smith',
                email: 'jane@example.com',
                password: 'ValidPass1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('resets form after successful submission', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'ValidPass1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
        });
    });
});
