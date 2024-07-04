import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- promise not handled
- userEvent.setuo fehtl

- TypeError
- unused import
- doppelung keine variable

- 3 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -20
CleanCode: -15
Testumfang: 41,75
 */

// Mock the fetch function to simulate successful API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ message: 'User created' }),
        status: 200,
    }),
);

describe('AddUserFormMittel', () => {
    const setUsersMock = jest.fn();
    const users: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks(); // Clear any mocked functions before each test
    });

    it.only('renders without errors', () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it('creates a new user with valid input', async () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        await userEvent.click(screen.getByText('Add User'));

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(setUsersMock).toHaveBeenCalledTimes(1);

        // Ensure the form is reset after submission
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('shows error alert if email is already taken', async () => {
        const existingUser = {
            name: 'Jane Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormMittel setUsers={setUsersMock} users={[existingUser]} />);

        await userEvent.type(screen.getByLabelText('Name'), 'John Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com'); // Duplicate email
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        await userEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('shows password errors for invalid password', async () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={[]} />);

        await userEvent.type(screen.getByLabelText('Password'), 'invalid');
        await userEvent.click(screen.getByText('Add User'));

        // Check if the password error helper text is displayed
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    // Add more tests for different scenarios:
    // - Invalid email formats
    // - Empty required fields
    // - Unsuccessful API calls (mock fetch to reject)
    // - ...
});
