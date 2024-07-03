import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: Verwendung von fireEvent
. critical: promises not handled
- critical: userEvent.setup() not used
- ciritcal: render in beforeEach

- unused import
- clean code: keine variablen erstellt - 3 mal
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -25
Testumfang: 42,9
*/

// Mocking the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
useRouter.mockImplementation(() => ({
    query: { shouldRoute: 'false' },
    push: mockPush,
}));

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    beforeEach(() => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component with initial state', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');
        expect(screen.getByLabelText('Email')).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays password errors when password does not meet criteria', async () => {
        await userEvent.type(screen.getByLabelText('Password'), 'pass');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('shows error if email is already taken', async () => {
        const existingUsers = [{ ...mockUsers, email: 'john.doe@example.com' }];
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={existingUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    test('calls createUser and updates user list on successful form submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '1' }),
            }),
        ) as jest.Mock;

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText('Create new User')).toBeInTheDocument();
        expect(mockSetUsers).toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
    });

    test('routes to new user page if shouldRoute is true', async () => {
        useRouter.mockImplementation(() => ({
            query: { shouldRoute: 'true' },
            push: mockPush,
        }));

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve({ userId: '1' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.ADMIN } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText('Create new User')).toBeInTheDocument();
        expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=1');
    });
});
