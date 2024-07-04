import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- setup doppelung
- doppelung keine Variable - 3
- screen
- const

- 4 von 4 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: 0
CleanCode: -30
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const renderComponent = () => render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders all form fields', () => {
        renderComponent();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        renderComponent();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('shows department field for admin and employee roles', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not show department field for customer role', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('displays error when email already exists', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'existing@example.com');
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('displays error when password does not meet requirements', async () => {
        renderComponent();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(passwordInput, 'weak');
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        renderComponent();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'ValidPass1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'John Doe',
                    email: 'john@example.com',
                    password: 'ValidPass1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });
});
