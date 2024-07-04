import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- waitFor

- doppelung keine Variable - 2
- screen
- userEvent
- unnötige waitFor - 2
- const

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -35
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const setup = () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
        return user;
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with all required fields', () => {
        setup();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        const user = setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('shows department field when role is ADMIN or EMPLOYEE', async () => {
        const user = setup();
        const roleSelect = screen.getByLabelText(/role/i);

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('displays error when email already exists', async () => {
        const existingUser: User = {
            name: 'Existing',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        const user = setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'existing@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
    });

    it('displays error when password does not meet requirements', async () => {
        const user = setup();
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('adds a new user when form is submitted with valid data', async () => {
        const user = setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'Password123!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });

    it.skip('resets form after successful submission', async () => {
        const user = setup();
        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        await waitFor(() => {
            expect(nameInput).toHaveValue('');
            expect(emailInput).toHaveValue('');
            expect(passwordInput).toHaveValue('');
            expect(roleSelect).toHaveValue('');
        });
    });
});
