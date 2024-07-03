import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: promises not handled
- critical: render in beforeEach

- clean code: keine variablen erstellt - 2 mal
- unused import
- TypeError - 2


- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -25
Testumfang: 50,05
*/

const mockSetUsers = jest.fn();
const initialUsers = [];

describe('AddUserFormSchwer', () => {
    beforeEach(() => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={initialUsers} />);
    });

    test('renders the form fields correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    test('displays error when email is already taken', async () => {
        const existingUsers = [
            { name: 'John Doe', email: 'johndoe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ];
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={existingUsers} />);

        await userEvent.type(screen.getByLabelText(/Email/i), 'johndoe@example.com');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test('displays password validation errors', async () => {
        await userEvent.type(screen.getByLabelText(/Password/i), 'short');

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        });
    });

    test('adds a new user successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '1' }),
            }),
        );

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'janedoe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...initialUsers,
                {
                    name: 'Jane Doe',
                    email: 'janedoe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]);
        });
    });

    test('displays department field when role is not customer', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });
});
