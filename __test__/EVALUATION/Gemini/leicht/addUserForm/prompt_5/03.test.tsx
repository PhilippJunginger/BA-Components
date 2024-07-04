import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // for extended matchers
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used

- unused import
- render Funktion
- doppelung variablen nicht benutzt - 2 mal
- doppelung scree.. - 2 mal

- 2 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -30
Testumfang: 37,5

 */

// Mock function to avoid direct state manipulation
const mockSetUsers = jest.fn();

// Mock user data
const mockUsers: User[] = [
    { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
];

// Reusable function to render the component
const renderComponent = () => {
    return render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
};

describe('AddUserFormLeicht', () => {
    // Reset mocks before each test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 1st Test: Form rendering
    it('renders the form with all input fields and a submit button', () => {
        renderComponent();

        // Check if all fields are present
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();

        // Initial state
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    // 2nd Test: Successful form submission
    it('adds a new user when form is filled correctly', async () => {
        renderComponent();

        // Fill in form fields (userEvent for more realistic interactions)
        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        // Submit the form
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        // Assertions
        expect(mockSetUsers).toHaveBeenCalledTimes(1); // Check if setUsers was called
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'New User', email: 'new@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);

        // Form should reset after successful submission
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    // 3rd Test: Error handling for duplicate email and password
    it('displays error messages for duplicate emails and invalid passwords', async () => {
        renderComponent();

        // Incorrect submission 1: Duplicate Email
        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com'); // Duplicate email
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();

        // Incorrect submission 2: Invalid Password
        await userEvent.clear(screen.getByLabelText('Email'));
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'short'); // Invalid password
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });
});
