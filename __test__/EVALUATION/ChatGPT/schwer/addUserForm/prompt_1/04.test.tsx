import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
. critical: promises not handled
- critical: userEvent.setup() not used

- unused import - 2 mal
- unnecessary waitFor - 3 mal
- clean code: keine variablen erstellt - 4 mal
- TypeError

- 5 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -50
Testumfang: 57,2
*/

// Mock useRouter from next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '1' }),
        status: 200,
    }),
);

describe('AddUserFormSchwer', () => {
    const setUsersMock = jest.fn();

    const usersMock: User[] = [];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: jest.fn(),
        });
    });

    test('renders the component', () => {
        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        expect(screen.getByLabelText('Name')).toHaveValue('John Doe');

        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        expect(screen.getByLabelText('Email')).toHaveValue('john@example.com');

        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
    });

    test('validates password', async () => {
        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Password'), 'short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Password'));
        await userEvent.type(screen.getByLabelText('Password'), 'NoDigit!');
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Password'));
        await userEvent.type(screen.getByLabelText('Password'), 'Nodigit1');
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('handles form submission', async () => {
        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(global.fetch).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(setUsersMock).toHaveBeenCalledTimes(1));
        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                role: USER_ROLE.ADMIN,
            },
        ]);
    });

    test('handles email already taken error', async () => {
        render(
            <AddUserFormSchwer
                users={[
                    {
                        name: 'Existing User',
                        email: 'john@example.com',
                        role: USER_ROLE.CUSTOMER,
                        password: 'Password123!',
                    },
                ]}
                setUsers={setUsersMock}
            />,
        );

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });

    test('handles API error', async () => {
        global.fetch.mockImplementationOnce(() =>
            Promise.resolve({
                json: () => Promise.resolve({ message: 'Error' }),
                status: 400,
            }),
        );

        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await screen.findByText('Es ist ein Fehler aufgetreten!');
    });

    test('navigates to user page on success', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            query: { shouldRoute: 'true' },
            push: pushMock,
        });

        render(<AddUserFormSchwer users={usersMock} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(pushMock).toHaveBeenCalledWith('http://localhost:3000/users?id=1'));
    });
});
