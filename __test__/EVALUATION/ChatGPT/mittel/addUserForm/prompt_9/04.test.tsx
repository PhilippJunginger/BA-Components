import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled
- critical: render in beforeEach
- critical: Verwendung von fireEvent

- constant missing
- render Funktion erstellt
- unnecessary waitFor - 3 mal
- clean code: keine variablen erstellt - 3 mal


- 4 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -40
Testumfang: 50,1
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const setup = () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        setup();
    });

    test('renders form elements', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('displays password validation errors', () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        fireEvent.change(passwordInput, { target: { value: 'weak' } });
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers on successful user addition', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password1!',
                },
            ]);
        });
    });

    test.skip('displays error message if email is already taken', async () => {
        render(
            <AddUserFormMittel users={[{ ...initialUser, email: 'john.doe@example.com' }]} setUsers={mockSetUsers} />,
        );

        const emailInput = screen.getByLabelText(/Email/i);
        await userEvent.type(emailInput, 'john.doe@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('clears error message when close icon is clicked', async () => {
        render(
            <AddUserFormMittel users={[{ ...initialUser, email: 'john.doe@example.com' }]} setUsers={mockSetUsers} />,
        );

        const emailInput = screen.getByLabelText(/Email/i);
        await userEvent.type(emailInput, 'john.doe@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText(/close-icon/i);
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
        });
    });

    test.skip('shows department field when role is ADMIN or EMPLOYEE', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
