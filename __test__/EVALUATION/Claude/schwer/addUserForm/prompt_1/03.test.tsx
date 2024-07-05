import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- fireEvent
- setup
- waitFor

- doppelung keine Variable - 3
- screen - 2
- typeerror


- 5 von 6 notwendigem Testumfang erreicht + 3 Redundant


Best-Practices: -30
CleanCode: -30
Testumfang: 58,45
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const mockRouter = { push: jest.fn(), query: {} };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('renders the component correctly', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    it('displays department field for non-customer roles', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('validates password requirements', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Password'), 'weak');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Password'));
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });

    it('handles form submission with valid data', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ userId: '123' }),
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'StrongPass123!',
                }),
            });
            expect(mockSetUsers).toHaveBeenCalled();
        });
    });

    it('handles form submission error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('prevents submission when email is already taken', async () => {
        const existingUsers = [{ email: 'john@example.com' }];
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={existingUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
            expect(global.fetch).not.toHaveBeenCalled();
        });
    });

    it('routes to user page when shouldRoute is true', async () => {
        mockRouter.query = { shouldRoute: 'true' };
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ userId: '123' }),
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'StrongPass123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
