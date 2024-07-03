import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: userEvent.setup nicht verwendet
- critical: fireEvent verwendet
- cirtical: promises not handled

- clean code: keine variablen erstellt - 3 mal
- TypeError - 3 mal

- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 42,9
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
useRouter.mockImplementation(() => ({
    query: {},
    push: mockPush,
}));

describe('AddUserFormSchwer', () => {
    const setUsers = jest.fn();
    const initialProps = {
        setUsers,
        users: [],
    };

    beforeEach(() => {
        setUsers.mockClear();
        mockPush.mockClear();
    });

    test('renders form elements correctly', () => {
        render(<AddUserFormSchwer {...initialProps} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('handles input changes correctly', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('Password1!');
        expect(screen.getByLabelText(/role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays password validation errors correctly', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/password/i), 'pass');
        fireEvent.blur(screen.getByLabelText(/password/i));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('submits form with valid data and redirects if shouldRoute is true', async () => {
        useRouter.mockImplementationOnce(() => ({
            query: { shouldRoute: 'true' },
            push: mockPush,
        }));

        render(<AddUserFormSchwer {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '123' }),
                status: 201,
            }),
        );

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123'));
    });

    test('displays error alert when email is already taken', async () => {
        const propsWithUsers = {
            ...initialProps,
            users: [{ name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: '' }],
        };

        render(<AddUserFormSchwer {...propsWithUsers} />);

        await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
    });

    test.skip('handles error when API request fails', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.reject('API Error'),
                status: 500,
            }),
        );

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await screen.findByText(/es ist ein fehler aufgetreten/i);
    });
});
