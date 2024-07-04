import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- fireEvent
- userEvent.setup missing
- assertions waitFOr

- doppelung keine Variable - 2
- typeError

- 2 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -30
CleanCode: -15
Testumfang: 16,7
 */

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();

    const mockUsers: User[] = [
        {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'securePassword123!',
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles user input correctly', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department'); // This input is initially hidden

        // Type user data
        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'SecurePassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } }); // Select a different role

        // Department input should now be visible for ADMIN role
        await waitFor(() => {
            expect(departmentInput).toBeInTheDocument();
        });

        await userEvent.type(departmentInput, 'Sales');
    });

    it('shows error for duplicate email', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'existing@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'SecurePassword123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('handles successful user creation', async () => {
        const mockResponse = { userId: '123' };
        fetch.mockResolvedValue({
            ok: true,
            json: async () => mockResponse,
        });
        const routerPushMock = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({
            push: routerPushMock,
            query: { shouldRoute: 'false' }, // Initially no routing
        } as any);

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'new@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'SecurePassword123!');
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New User',
                    email: 'new@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'SecurePassword123!',
                }),
            });
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'New User',
                    email: 'new@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'SecurePassword123!',
                },
            ]);
            expect(routerPushMock).not.toHaveBeenCalled(); // No routing when shouldRoute is false
        });
    });

    // ... additional test cases for password validation, role selection, error scenarios, etc.
});
