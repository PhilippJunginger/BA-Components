import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup missing
- fireEvent
- waitFor assetions

- unused import - 2
- doppelung keine Variable - 2

- 4 von 4 notwendigem Testumfang erreicht + 1 ausnahme + 2 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 75
 */

const mockSetUsers = jest.fn();

const initialUsers: User[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
];

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'StrongPass1!' },
        ]);
    });

    it('displays error when email already exists', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('displays error when password is invalid', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'weakpass');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows department field for non-customer roles', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('hides department field for customer role', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('resets form after successful submission', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Smith');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toHaveValue('');
            expect(screen.getByLabelText('Email')).toHaveValue('');
            expect(screen.getByLabelText('Password')).toHaveValue('');
            expect(screen.getByLabelText('Role')).toHaveValue('');
        });
    });
});
