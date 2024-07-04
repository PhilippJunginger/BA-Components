import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- userEvent.setup
- fireEvent
- promises not handled

- TypeError - 5 mal
- Doppelung variablen - 2 mal

- 4 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -30
CleanCode: -35
Testumfang: 58,45
 */

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = []; // Empty users array for initial tests

    beforeEach(() => {
        jest.clearAllMocks();
        //fetchMock.resetMocks();
    });

    test('renders the form elements', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('displays department field when role is not customer', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    test('shows error alert when submission fails', async () => {
        //fetchMock.mockReject(new Error('API Error'));

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test('validates password and shows error messages', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Password'), 'invalid'); // Invalid password

        fireEvent.submit(screen.getByText('Add User'));

        expect(screen.getByLabelText('Password')).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        // Add more assertions for other password validation messages
    });

    test('adds a new user successfully', async () => {
        //fetchMock.mockResponse(JSON.stringify({}), { status: 201 });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Test User');
        await userEvent.type(screen.getByLabelText('Email'), 'test@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword123!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByText('Add User'));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'Test User',
                    email: 'test@example.com',
                    password: 'TestPassword123!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });
    // Add more tests for other functionalities and edge cases
});
