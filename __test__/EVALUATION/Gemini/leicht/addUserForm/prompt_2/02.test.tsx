import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../models/user';

/*

- unused import
- clean code: Doppelung - keine variablen - 2 mal

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -15
Testumfang: 62,5
 */

describe('AddUserFormLeicht Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly with default values', () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('adds a new user with valid data', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'johndoe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        await user.type(screen.getByLabelText('Department'), 'Sales');

        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'johndoe@example.com',
                password: 'Password123!',
                role: USER_ROLE.ADMIN,
                department: 'Sales',
            },
        ]);
    });

    it('shows an error for existing email', async () => {
        mockUsers.push({
            name: 'Jane Smith',
            email: 'janesmith@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        });

        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
        await user.type(screen.getByLabelText('Email'), 'janesmith@example.com');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error messages for invalid password', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);

        await user.type(screen.getByLabelText('Password'), 'invalid');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        const passwordError = screen.getByText('Password needs to be 8 characters long');
        expect(passwordError).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    // Add more tests for other error conditions (e.g., missing required fields)
});
