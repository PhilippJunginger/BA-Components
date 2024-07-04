import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent
- promise not handled
- userEvent.setuo fehtl

- TypeError
- unnötige waitFOr

- 2 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -30
CleanCode: 10
Testumfang: 25,05
 */

// Mock fetch to control API responses
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = []; // Start with empty users array

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles form submission successfully', async () => {
        const mockNewUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'SecurePassword123!',
        };

        // Mock a successful API response
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => mockNewUser,
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        // Fill in the form using userEvent for more realistic interactions
        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: mockNewUser.role } });
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, mockNewUser]);
        });
    });

    it('displays password validation errors', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Password'), 'invalid'); // Invalid password
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
            // ... other password validation errors
        });
    });

    // Add more tests to cover different scenarios:
    // - Duplicate email error
    // - Failed API request
    // - Department field visibility based on role
    // - ...
});
