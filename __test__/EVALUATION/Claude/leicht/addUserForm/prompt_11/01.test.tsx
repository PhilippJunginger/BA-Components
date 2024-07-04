import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- setup doppelung
- doppelung keine Variable - 3
- screen - 2
- const
- render Funktion

- 4 von 4 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: 0
CleanCode: -45
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

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

    it('updates form fields when user types', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');

        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('Password123!');
    });

    it('shows department field when role is ADMIN or EMPLOYEE', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/role/i);
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it('does not show department field when role is CUSTOMER', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/role/i);
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it('shows error when email already exists', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('shows error when password does not meet requirements', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'weakpassword');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('adds a new user when form is submitted with valid data', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /add user/i }));

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

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });
});
