import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled
- critical: userEvent.setup() nicht verwendet
- critical: Verwendung von fireEvent
- critical: render in beforeEach
- critical: too many assertions waitFOr

- clean code: keine variablen erstellt - 2 mal


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 2 Redundanz


Best-Practices: -50
CleanCode: -10
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

    it.skip('displays error when email is already taken', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

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

        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'new@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'New User', email: 'new@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
            ]);
        });
    });

    it.skip('displays department field when role is not customer', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it.skip('hides department field when role is customer', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('closes error alert when close icon is clicked', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/email/i), 'existing@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText(/close-icon/i));

        await waitFor(() => {
            expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
        });
    });
});
