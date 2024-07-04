import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- fireEvent
- promise not handled
- userEvent.setuo fehtl
- render in beforeEach

- TypeError
- unused import
- doppelung keine variable

- 2 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -40
CleanCode: -15
Testumfang: 25,05
 */

// Mock the fetch API
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = []; // Start with an empty array of users

    beforeEach(() => {
        // Reset mocks and component state before each test
        jest.clearAllMocks();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders form fields correctly', () => {
        // Check if all required form fields are rendered
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('validates password correctly', async () => {
        // Test password validation with invalid inputs
        const passwordField = screen.getByLabelText('Password');
        await userEvent.type(passwordField, 'invalid');
        fireEvent.submit(screen.getByRole('form'));

        // Check if the password error helper text is displayed
        await waitFor(() => {
            expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        });

        // Test password validation with a valid input
        await userEvent.clear(passwordField);
        await userEvent.type(passwordField, 'ValidPass123!');
        fireEvent.submit(screen.getByRole('form'));

        // Check if the password error helper text is not displayed
        await waitFor(() => {
            expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
        });
    });

    it('handles email validation correctly', async () => {
        // Test email validation with a duplicate email
        mockUsers.push({
            name: 'John Doe',
            email: 'test@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password123',
        });
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const emailField = screen.getByLabelText('Email');
        await userEvent.type(emailField, 'test@example.com');
        fireEvent.submit(screen.getByRole('form'));

        // Check if the error alert is displayed
        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });

        // Test email validation with a valid email
        await userEvent.clear(emailField);
        await userEvent.type(emailField, 'unique@example.com');
        fireEvent.submit(screen.getByRole('form'));

        // Check if the error alert is not displayed (if the mock fetch succeeds)
        await waitFor(() => {
            expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
        });
    });

    // ... more tests for form submission, error handling, etc.
});
