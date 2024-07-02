import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical eslint error: userEvent Promise not handled
- critical: render in beforeEach
- critical: kein userEvent.setup()

- unused import
- unnecessary awaitn of element
- TypeScript error for fetch
- clean code: Doppelung - keine variablen erstellt in zweitem test - 3 mal

- 5 von 6 notwendigem Testumfang erreicht + 5 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 41,75
 */

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        status: 200,
        json: () => Promise.resolve({}),
    }),
);

const mockSetUsers = jest.fn();
const mockUsers = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' }];

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component', () => {
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it.skip('updates name state on input change', async () => {
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it.skip('updates email state on input change', async () => {
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it.skip('shows password error messages when password does not meet criteria', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it.skip('shows an error alert if email is already taken', async () => {
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);
        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it.skip('calls setUsers with the new user and resets form on successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        await screen.findByLabelText('Name'); // Wait for the form to reset

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.EMPLOYEE,
                password: 'Password123!',
            },
        ]);
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it.skip('does not submit the form if password is invalid', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(global.fetch).not.toHaveBeenCalled();
    });

    it.skip('does not show department field for customer role', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it.skip('shows department field for admin or employee roles', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it.skip('closes error alert on close button click', async () => {
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        const alertCloseButton = await screen.findByLabelText('close-icon');
        await userEvent.click(alertCloseButton);

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
