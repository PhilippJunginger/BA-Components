import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: unhandled promise from userEvent
- critical: keine Verwendung von userEvent.setup()

- unnötige render Funktion
- clean code: Doppelung - keine variablen erstellt in zweitem test - 3 mal
- unnötige await waitFor - 5 mal


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -45
Testumfang: 66,8
*/

const mockSetUsers = jest.fn();

const renderComponent = (users: User[] = []) => {
    render(<AddUserFormMittel users={users} setUsers={mockSetUsers} />);
};

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', () => {
        renderComponent();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays password error messages', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('displays error if email is already taken', async () => {
        const existingUsers = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        renderComponent(existingUsers);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test('submits the form successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });

    test('handles API error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        ) as jest.Mock;

        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test('closes error alert', async () => {
        renderComponent();
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'jane.doe@example.com');

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
