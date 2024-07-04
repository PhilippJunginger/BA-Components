import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used
- critical: fireEvent
- critical: promises not handled
- critical: render in beforeEach


- interaktions FUnktion
- doppelung variablen nicht benutzt - 1 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -10
Testumfang: 62,5

 */

// Mock function to simulate setting users
const mockSetUsers = jest.fn();

describe('AddUserFormLeicht Component', () => {
    // Helper function for form interaction
    const fillAndSubmitForm = async (userData: Partial<User>) => {
        const { name, email, password, role, department } = userData;

        if (name) await userEvent.type(screen.getByLabelText('Name'), name);
        if (email) await userEvent.type(screen.getByLabelText('Email'), email);
        if (password) await userEvent.type(screen.getByLabelText('Password'), password);
        if (role) await userEvent.selectOptions(screen.getByLabelText('Role'), role);
        if (department) await userEvent.type(screen.getByLabelText('Department'), department);

        fireEvent.submit(screen.getByRole('form')); // Submit the form
    };

    beforeEach(() => {
        // Render component before each test
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);
    });

    // Initial test (Developer 1)
    test('renders form fields correctly', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    // Improved test (Group discussion, Developer 2)
    test('shows error message if email already exists', async () => {
        // Render with existing user
        render(
            <AddUserFormLeicht
                users={[
                    { name: 'John', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
                ]}
                setUsers={mockSetUsers}
            />,
        );

        await fillAndSubmitForm({ email: 'john@example.com', password: 'Password123!' });
        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    // Further refined test (Developer 3)
    test('shows error message for invalid password', async () => {
        await fillAndSubmitForm({ password: 'invalid' });

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    // Advanced test (Group effort)
    test('adds a new user with valid data and clears the form', async () => {
        const newUser = {
            name: 'Jane',
            email: 'jane@example.com',
            password: 'Password123!',
            role: USER_ROLE.ADMIN,
            department: 'Engineering',
        };

        await fillAndSubmitForm(newUser);

        // Ensure the mockSetUsers function is called with the correct data
        expect(mockSetUsers).toHaveBeenCalledWith([newUser]);

        // Check that the form fields are cleared after successful submission
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByLabelText('Department')).toHaveValue('');
    });

    // ...more tests for other scenarios (invalid roles, form submission without filling, etc.)
});
