import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled
- critical: render in beforeEach
- critical: userEvent.setup() nicht benutzt
- critical: too many assertions waitFor

- unused import
- unnecessary waitFors - 3 mal
- clean code: Doppelung - keine variablen erstellt - 2 mal


- 5 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: -40
CleanCode: -30
Testumfang: 75,15
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders the form correctly', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('shows password error messages when password is invalid', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            expect(
                screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
            expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
        });
    });

    it('displays an error if email is already taken', async () => {
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('submits the form successfully with valid data', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });

    it('displays department field when role is ADMIN or EMPLOYEE', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await waitFor(() => {
            expect(screen.getByLabelText('Department')).toBeInTheDocument();
        });
    });

    it('hides department field when role is CUSTOMER', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        await waitFor(() => {
            expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
        });
    });

    it('closes the error alert when close icon is clicked', async () => {
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('close-icon');
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
        });
    });
});
