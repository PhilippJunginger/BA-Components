import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: userEvent.setup() fehlt

- clean code: keine variablen erstellt - 2 mal
- unused import

- 5 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -15
Testumfang: 57,2
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = useRouter as jest.Mock;

describe('AddUserFormSchwer', () => {
    const setUsersMock = jest.fn();

    const usersMock: User[] = [];

    beforeEach(() => {
        mockRouter.mockReturnValue({
            query: {},
            push: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    test.skip('handles input changes', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test.skip('shows password error messages', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test.skip('handles form submission with valid data', async () => {
        const newUser: User = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password123!',
        };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, newUser.name);
        await userEvent.type(emailInput, newUser.email);
        await userEvent.type(passwordInput, newUser.password);
        await userEvent.selectOptions(roleSelect, newUser.role);

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([newUser]);
        });
    });

    test.skip('handles form submission with existing email', async () => {
        const existingUser: User = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password123!',
        };

        render(<AddUserFormSchwer setUsers={setUsersMock} users={[existingUser]} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, existingUser.email);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test.skip('handles form submission with API error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ error: 'Bad Request' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test.skip('navigates to user page after successful submission if shouldRoute is true', async () => {
        mockRouter.mockReturnValue({
            query: { shouldRoute: 'true' },
            push: jest.fn(),
        });

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer setUsers={setUsersMock} users={usersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
