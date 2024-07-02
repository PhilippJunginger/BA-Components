import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: unhandled promise from userEvent

- unused import - 2 mal
- unnecessary await waitFor - 4 mal
- clean code: komplizierte InitialProps
- clean code: doppelung von userEvent.setup()
- clean code: Doppelung - keine variablen erstellt in zweitem test - 3 mal


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -55
Testumfang: 66,8
*/

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
    }),
) as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', () => {
        render(<AddUserFormMittel {...initialProps} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        render(<AddUserFormMittel {...initialProps} />);
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
        render(<AddUserFormMittel {...initialProps} />);
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('handles form submission with valid data', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]);
        });
    });

    test('handles form submission with existing email', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
            role: USER_ROLE.EMPLOYEE,
            password: 'Password123!',
        };
        render(<AddUserFormMittel {...initialProps} users={[existingUser]} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test('handles API error during form submission', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        );

        render(<AddUserFormMittel {...initialProps} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test('closes error alert', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(emailInput, 'existing.email@example.com');
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
