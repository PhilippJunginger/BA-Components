import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: Verwendung von fireEvent

- Typescript Error bei global fetch zuweisung
- clean code: doppelung von userEvent.setup()
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal

- 4 von 6 notwendigem Testumfang erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -20
Testumfang: 58,45
*/

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 201,
        json: () => Promise.resolve({}),
    }),
);

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const users: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('renders the form with initial state', () => {
        render(<AddUserFormMittel users={users} setUsers={mockSetUsers} />);

        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
        expect(screen.queryByText(/password needs to be 8 characters long/i)).not.toBeInTheDocument();
    });

    it('shows password error messages for invalid passwords', async () => {
        render(<AddUserFormMittel users={users} setUsers={mockSetUsers} />);
        const passwordField = screen.getByLabelText(/password/i);

        fireEvent.change(passwordField, { target: { value: 'short' } });
        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('adds a new user when form is submitted with valid data', async () => {
        render(<AddUserFormMittel users={users} setUsers={mockSetUsers} />);

        const nameField = screen.getByLabelText(/name/i);
        const emailField = screen.getByLabelText(/email/i);
        const passwordField = screen.getByLabelText(/password/i);
        const roleField = screen.getByLabelText(/role/i);

        await userEvent.type(nameField, 'John Doe');
        await userEvent.type(emailField, 'john.doe@example.com');
        await userEvent.type(passwordField, 'Password123!');
        await userEvent.selectOptions(roleField, USER_ROLE.ADMIN);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
                role: USER_ROLE.ADMIN,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                password: 'Password123!',
                role: USER_ROLE.ADMIN,
            },
        ]);
    });

    it('shows error alert when email is already taken', async () => {
        const existingUsers = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE, password: 'Test1234!' },
        ];
        render(<AddUserFormMittel users={existingUsers} setUsers={mockSetUsers} />);

        const emailField = screen.getByLabelText(/email/i);

        await userEvent.type(emailField, 'jane.doe@example.com');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('clears the error alert when the close icon is clicked', async () => {
        render(<AddUserFormMittel users={users} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/email/i), 'jane.doe@example.com');
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText(/close-icon/i));

        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
