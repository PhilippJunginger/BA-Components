import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*

- TypeError
- userEvent.setuo doppelung
- Doppelung variablen - 2

- 1 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: 0
CleanCode: -20
Testumfang: 0
 */

// Mock fetch to simulate API calls
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [
        { name: 'Existing User', email: 'existing@user.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
        fetch.mockImplementation(async () =>
            Promise.resolve({
                status: 200,
                json: async () => ({ success: true }),
            }),
        );
    });

    it('renders correctly with initial values', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Check if all fields are present and have the correct default values
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });

    it('handles form input changes', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Input valid values into the form
        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), 'new@user.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        // Verify that the newUser state is updated correctly
        expect(screen.getByLabelText('Name')).toHaveValue('New User');
        expect(screen.getByLabelText('Email')).toHaveValue('new@user.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Password123!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.CUSTOMER);
    });

    // ... (Add more test cases for other interactions, edge cases, and error handling)

    it('handles form submission successfully', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Input valid values into the form
        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), 'new@user.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        // Submit the form
        fireEvent.submit(screen.getByRole('form'));

        // Wait for the fetch call to resolve
        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));

        // Verify that setUsers was called with the updated user list
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'New User', email: 'new@user.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    // ... (Add more test cases for unsuccessful form submission, password validation errors, and other scenarios)
});
