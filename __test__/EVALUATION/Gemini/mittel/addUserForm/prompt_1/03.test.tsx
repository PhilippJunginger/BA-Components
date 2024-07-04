import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup
- fireEvent

- TypeError
- Doppelung variablen - 2 mal

- 2 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -15
Testumfang: 16,7
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const setUsersMock = jest.fn();
    const users: User[] = []; // Initial empty users array

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders correctly with initial values', () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('handles input changes correctly', async () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        // Test name input
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');

        // Test email input
        await userEvent.type(emailInput, 'johndoe@example.com');
        expect(emailInput).toHaveValue('johndoe@example.com');

        // Test password input (valid password)
        await userEvent.type(passwordInput, 'ValidPassword123!');
        expect(passwordInput).toHaveValue('ValidPassword123!');

        // Test role selection
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    test('displays password error messages for invalid password', async () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'invalid'); // Invalid password

        // Check if error messages are displayed
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('submits form with valid data', async () => {
        const newUser: User = {
            name: 'John Doe',
            email: 'johndoe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'ValidPassword123!',
        };
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => newUser,
        } as Response);

        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, newUser.name);
        await userEvent.type(emailInput, newUser.email);
        await userEvent.type(passwordInput, newUser.password);
        fireEvent.change(roleSelect, { target: { value: newUser.role } });

        await userEvent.click(submitButton);

        await waitFor(() => expect(setUsersMock).toHaveBeenCalledWith([newUser]));
    });

    // ... more tests for error handling, duplicate email, etc.
});
