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
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    test('renders form elements correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('displays password error messages when password is invalid', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(
                screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    test('displays error when email is already taken', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await userEvent.type(emailInput, 'john@example.com');

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('calls setUsers with new user when form is valid', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(addButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
            ]);
        });
    });

    test.skip('displays department field when role is ADMIN or EMPLOYEE', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('hides department field when role is CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    test('closes error alert when close icon is clicked', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await userEvent.type(emailInput, 'john@example.com');

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(addButton);

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText(/close-icon/i);
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
        });
    });
});
