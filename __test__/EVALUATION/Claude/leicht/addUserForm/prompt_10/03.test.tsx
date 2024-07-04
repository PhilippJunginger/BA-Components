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
- render funkton

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

    it('renders the form with all required fields', () => {
        renderComponent();

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('updates form fields when user types', async () => {
        renderComponent();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('shows department field when role is ADMIN or EMPLOYEE', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/Role/i);

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('does not show department field when role is CUSTOMER', async () => {
        renderComponent();
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/Role/i);

        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    it.skip('shows error when email already exists', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'existing@example.com');

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(addButton);

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it('shows error when password does not meet requirements', async () => {
        renderComponent();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'weakpassword');

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(addButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'John Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'ValidPass1!');

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(addButton);

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
