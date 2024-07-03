import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled
- critical: userEvent.setup() nicht verwendet
- critical: render in beforeEach
- critical: too many assertions waitFOr

- unused import
- unnecessary waitFor - 4 mal
- clean code: keine variablen erstellt - 3 mal


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 2 Redundanz


Best-Practices: -40
CleanCode: -40
Testumfang: 50,1
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders the form correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('displays password error messages when password is invalid', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(
                screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it('displays error when email is already taken', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('calls setUsers with new user when form is submitted successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'Password1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'New User', email: 'new@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
            ]);
        });
    });

    it.skip('displays department field when role is not customer', async () => {
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it.skip('hides department field when role is customer', async () => {
        const roleSelect = screen.getByLabelText(/role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it('closes error alert when close icon is clicked', async () => {
        const emailInput = screen.getByLabelText(/email/i);
        await userEvent.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText(/close-icon/i);
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
        });
    });
});
