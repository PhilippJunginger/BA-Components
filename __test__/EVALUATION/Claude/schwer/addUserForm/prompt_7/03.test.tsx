import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- setup

- waitFor - 2
- doppelung keine Variable - 4
- scereen - 2
- typeerror


- 6 von 7 notwendigem Testumfang erreicht + 3  Redundant


Best-Practices: 0
CleanCode: -45
Testumfang: 64,35
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: 'mocked-user-id' }),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockImplementation(() => ({
            query: {},
            push: mockPush,
        }));
    });

    it('renders the form correctly', () => {
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
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('displays password error messages', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Password'), 'weak');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('shows Department field for non-customer roles', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('submits the form successfully', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                role: USER_ROLE.CUSTOMER,
            }),
        });
    });

    it('handles email already taken error', async () => {
        const existingUsers = [{ email: 'john@example.com' }];
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={existingUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('routes to user page when shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockImplementation(() => ({
            query: { shouldRoute: 'true' },
            push: mockPush,
        }));

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=mocked-user-id');
        });
    });

    it('handles API error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ error: 'API Error' }),
                status: 400,
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('closes error alert when close icon is clicked', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ error: 'API Error' }),
                status: 400,
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText('close-icon'));

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
