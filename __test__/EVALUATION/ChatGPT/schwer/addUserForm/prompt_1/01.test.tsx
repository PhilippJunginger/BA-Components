import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: render in beforeEach
- critical: Verwendung von fireEvent
. critical: promises not handled
- critical: userEvent.setup() not used


- unused import
- clean code: keine variablen erstellt - 3 mal
- render Funktion erstellt

- 3 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -40
CleanCode: -25
Testumfang: 35,75
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
    query: { shouldRoute: 'true' },
    push: mockPush,
});

const renderComponent = (props = {}) => {
    const defaultProps = {
        setUsers: jest.fn(),
        users: [],
    };
    return render(<AddUserFormSchwer {...defaultProps} {...props} />);
};

describe('AddUserFormSchwer', () => {
    it('renders the component', () => {
        renderComponent();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it.skip('handles input changes', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john@example.com');
        expect(emailInput).toHaveValue('john@example.com');

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('displays password errors', async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'pass');
        fireEvent.blur(passwordInput);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it.skip('submits the form successfully', async () => {
        const mockSetUsers = jest.fn();
        renderComponent({ setUsers: mockSetUsers });

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        global.fetch = jest.fn().mockResolvedValue({
            status: 201,
            json: jest.fn().mockResolvedValue({ userId: '123' }),
        });

        await userEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);

        await screen.findByText('Create new User');
        expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
    });

    it.skip('displays error if email already taken', async () => {
        const existingUsers = [{ email: 'john@example.com' } as User];
        renderComponent({ users: existingUsers });

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it.skip('closes error alert', async () => {
        renderComponent();

        const errorAlert = screen.getByText('Es ist ein Fehler aufgetreten!');
        const closeButton = screen.getByLabelText('close-icon');

        await userEvent.click(closeButton);
        expect(errorAlert).not.toBeInTheDocument();
    });
});
