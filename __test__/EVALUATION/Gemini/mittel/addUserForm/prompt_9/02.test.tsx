import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import userEvent from '@testing-library/user-event';

/*
- userEvent.setuo fehtl

- unused import
- unnötige waitFOr

- 2 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -10
CleanCode: -10
Testumfang: 25,05
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('validates password input', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('handles email input and prevents duplicates', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@test.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password123!',
        };
        render(<AddUserFormMittel setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'existing@test.com');

        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    // ... additional tests for form submission, error handling, etc.
});
