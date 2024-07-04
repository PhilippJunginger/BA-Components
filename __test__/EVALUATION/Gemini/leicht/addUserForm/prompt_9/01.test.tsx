import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render in beforeEach
- userEvent,setup fehtl

- unused import
- doppelung - keine Variable - 2 mal
- TypeError

- 2 von 4 notwendigem Testumfang erreicht + 1 Redundanzen


Best-Practices: -20
CleanCode: -20
Testumfang: 37,5
 */

const mockSetUsers = jest.fn();
const mockUsers = []; // Start with empty users array

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders all required input fields', () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(roleSelect).toBeInTheDocument();
        expect(addButton).toBeInTheDocument();
    });

    it('adds a new user with valid input', async () => {
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(addButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john@example.com', password: 'Password123!', role: USER_ROLE.CUSTOMER },
        ]);
        expect(nameInput).toHaveValue(''); // Check if fields are reset
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });

    it('shows error for duplicate email', async () => {
        mockUsers.push({
            name: 'Existing User',
            email: 'existing@example.com',
            password: 'Password123!',
            role: USER_ROLE.CUSTOMER,
        });

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        await userEvent.type(emailInput, 'existing@example.com'); // Use the existing email

        // ... rest of the form filling (name, password, role, submit) ...

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    // ... more tests for invalid passwords, department field behavior, etc.
});
