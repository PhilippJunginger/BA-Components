import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup missing

- unused import - 2
- doppelung keine Variable - 4
- doppelung screen...
- render Funktion

- 4 von 4 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -10
CleanCode: -40
Testumfang: 87,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    const renderComponent = () => render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with all required fields', () => {
        renderComponent();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it.skip('shows department field when role is ADMIN or EMPLOYEE', async () => {
        renderComponent();
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('updates form fields on user input', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('StrongPass1!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it.skip('shows error when email already exists', async () => {
        renderComponent();
        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'existing@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error when password does not meet requirements', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'weak');
        await userEvent.click(submitButton);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('successfully adds a new user when form is valid', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane@example.com');
        await userEvent.type(passwordInput, 'StrongPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'Jane Doe', email: 'jane@example.com', password: 'StrongPass1!', role: USER_ROLE.CUSTOMER },
        ]);

        // Check if form is reset after submission
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it.skip('handles department input for ADMIN and EMPLOYEE roles', async () => {
        renderComponent();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Admin User');
        await userEvent.type(emailInput, 'admin@example.com');
        await userEvent.type(passwordInput, 'AdminPass1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const departmentInput = screen.getByLabelText(/department/i);
        await userEvent.type(departmentInput, 'IT');

        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'AdminPass1!',
                role: USER_ROLE.ADMIN,
                department: 'IT',
            },
        ]);
    });
});
