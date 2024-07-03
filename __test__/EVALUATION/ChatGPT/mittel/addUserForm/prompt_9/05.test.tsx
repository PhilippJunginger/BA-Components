import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled

- unused import
- not needed library imported
- unnecessary waitFor - 7 mal
- clean code: keine variablen erstellt - 1 mal


- 4 von 6 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -10
CleanCode: -50
Testumfang: 58,45
*/

const mockSetUsers = jest.fn();
const mockUsers: User[] = [];

/*jest.mock('node-fetch', () => jest.fn());
import fetch from 'node-fetch';
const { Response } = jest.requireActual('node-fetch');*/

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('displays password error messages', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        });
    });

    it.skip('does not submit the form with invalid password', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'short');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockSetUsers).not.toHaveBeenCalled();
        });
    });

    it.skip('displays error when email is already taken', async () => {
        const takenEmailUsers = [
            { email: 'taken@example.com', name: 'Existing User', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        render(<AddUserFormMittel users={takenEmailUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    it.skip('submits the form with valid inputs', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
            new Response(JSON.stringify({}), { status: 201 }),
        );

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalled();
        });
    });

    it.skip('displays error on failed submission', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        (fetch as jest.MockedFunction<typeof fetch>).mockResolvedValueOnce(
            new Response(JSON.stringify({}), { status: 400 }),
        );

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    it.skip('handles closing of the error alert', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText(/close-icon/i));

        await waitFor(() => {
            expect(screen.queryByText(/es ist ein fehler aufgetreten/i)).not.toBeInTheDocument();
        });
    });
});
