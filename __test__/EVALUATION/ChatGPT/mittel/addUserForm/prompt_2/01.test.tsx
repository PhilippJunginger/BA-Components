import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- unused import
- clean code: unnecessary render function
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -20
Testumfang: 66,8
 */

// Mock the fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
    }),
) as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const renderComponent = () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    };

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
    });

    test('updates state on input change', async () => {
        renderComponent();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    test('shows password error when criteria are not met', async () => {
        renderComponent();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('does not submit form if password criteria are not met', async () => {
        renderComponent();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(passwordInput, 'short');
        await user.click(submitButton);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('shows error if email is already taken', async () => {
        const mockUsersWithExistingEmail: User[] = [
            { name: 'Jane', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsersWithExistingEmail} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, 'jane@example.com');
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(global.fetch).not.toHaveBeenCalled();
    });

    test('submits form with valid data', async () => {
        renderComponent();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await user.click(submitButton);

        expect(global.fetch).toHaveBeenCalledWith(
            'http://localhost:8080/user',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                }),
            }),
        );
        expect(mockSetUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'John Doe',
                    email: 'john@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                }),
            ]),
        );
    });

    test('handles server error gracefully', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                status: 500,
                json: () => Promise.resolve({ message: 'Internal Server Error' }),
            }),
        );

        renderComponent();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });
});
