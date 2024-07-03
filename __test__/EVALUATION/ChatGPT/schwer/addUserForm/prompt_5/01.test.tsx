import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- very critical: kein userEvent
- critical: Verwendung fireEvent
- critical: descturing from render instead of using screen

- clean code: keine variablen erstellt - 2 mal
- TypeError - 2

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -20
Testumfang: 50,05
*/

// Mock router and fetch
jest.mock('next/router', () => ({
    useRouter() {
        return {
            query: { shouldRoute: 'false' },
            push: jest.fn(),
        };
    },
}));
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '12345' }),
        status: 200,
    }),
);

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();

    const initialUsers = [{ name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN, password: 'Pass123!' }];

    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockClear();
    });

    it('renders without crashing', () => {
        const { getByText } = render(<AddUserFormSchwer users={initialUsers} setUsers={mockSetUsers} />);
        expect(getByText('Create new User')).toBeInTheDocument();
    });

    it.skip('validates email input and shows error on duplicate emails', async () => {
        const { getByLabelText, getByText } = render(
            <AddUserFormSchwer users={initialUsers} setUsers={mockSetUsers} />,
        );
        const emailInput = getByLabelText('Email');
        fireEvent.change(emailInput, { target: { value: 'alice@example.com' } });
        fireEvent.submit(getByText('Add User'));
        await waitFor(() => {
            expect(getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it.skip('adds a new user when form is submitted with valid data', async () => {
        const { getByLabelText, getByText } = render(
            <AddUserFormSchwer users={initialUsers} setUsers={mockSetUsers} />,
        );
        fireEvent.change(getByLabelText('Name'), { target: { value: 'Bob' } });
        fireEvent.change(getByLabelText('Email'), { target: { value: 'bob@example.com' } });
        fireEvent.change(getByLabelText('Password'), { target: { value: 'Password1!' } });
        fireEvent.change(getByLabelText('Role'), { target: { value: USER_ROLE.USER } });
        fireEvent.submit(getByText('Add User'));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...initialUsers,
                { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.USER, password: 'Password1!' },
            ]);
        });
    });

    it.skip('handles server error correctly', async () => {
        fetch.mockImplementationOnce(() => Promise.reject(new Error('Failed to fetch')));
        const { getByLabelText, getByText } = render(
            <AddUserFormSchwer users={initialUsers} setUsers={mockSetUsers} />,
        );
        fireEvent.change(getByLabelText('Name'), { target: { value: 'Charlie' } });
        fireEvent.submit(getByText('Add User'));

        await waitFor(() => {
            expect(getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it.skip('tests password validations', () => {
        const { getByLabelText, getByText } = render(
            <AddUserFormSchwer users={initialUsers} setUsers={mockSetUsers} />,
        );
        const passwordInput = getByLabelText('Password');
        fireEvent.change(passwordInput, { target: { value: 'short' } });
        fireEvent.blur(passwordInput);

        expect(getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    // Additional tests could include testing routing, testing department field visibility based on role, etc.
});
