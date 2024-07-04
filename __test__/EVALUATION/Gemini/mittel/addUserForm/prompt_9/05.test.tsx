import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent
- userEvent.setuo fehtl
- render in beforeEach

- TypeError


- 3 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -30
CleanCode: -5
Testumfang: 41,75
 */

// Mock fetch to simulate API calls
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const setUsersMock = jest.fn();
    const users = [
        { name: 'John Doe', email: 'johndoe@example.com', role: USER_ROLE.ADMIN, password: 'securePassword123' },
    ];

    beforeEach(() => {
        // Reset mocks and render component before each test
        jest.clearAllMocks();
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);
    });

    it('renders the form fields correctly', () => {
        // Check if all required input fields are present
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('displays password error messages when validation fails', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'invalid'); // Enter an invalid password
        fireEvent.blur(passwordInput);

        // Check if error messages are displayed
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('displays an error alert when email is already taken', async () => {
        // Mock fetch to return a conflict error
        fetch.mockResolvedValueOnce({
            status: 409,
            json: async () => ({ message: 'Email already taken' }),
        });

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'johndoe@example.com'); // Same email as the existing user
        await userEvent.type(passwordInput, 'securePassword123');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        // Check if error alert is displayed
        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('successfully adds a new user when all inputs are valid', async () => {
        // Mock fetch to return a successful response
        fetch.mockResolvedValueOnce({
            status: 200,
            json: async () => ({ id: 2, ...newUser }),
        });

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');
        const newUser = {
            name: 'Jane Doe',
            email: 'janedoe@example.com',
            role: USER_ROLE.EMPLOYEE,
            password: 'securePassword123',
        };

        await userEvent.type(nameInput, newUser.name);
        await userEvent.type(emailInput, newUser.email);
        await userEvent.type(passwordInput, newUser.password);
        await userEvent.selectOptions(roleSelect, newUser.role);
        await userEvent.click(submitButton);

        // Check if setUsers is called with the updated user list
        expect(setUsersMock).toHaveBeenCalledWith([...users, newUser]);

        // Check if form fields are cleared after successful submission
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    // Add more tests for other scenarios like invalid inputs, different user roles, etc.
});
