import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- waitFor
- render
- fireEvent

- setup doppelung
- doppelung keine Variable - 3
- screen 1
- const

- 4 von 4 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -30
CleanCode: -30
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('renders the form with all required fields', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('allows input in all fields', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('Password123!');
        expect(screen.getByLabelText(/role/i)).toHaveTextContent(USER_ROLE.CUSTOMER);
    });

    it('shows department field for non-customer roles', async () => {
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it('hides department field for customer role', async () => {
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it('shows error for invalid password', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'weak');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('shows error for existing email', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        const { rerender } = render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'existing@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it('adds a new user when form is submitted with valid data', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

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
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toHaveValue('');
            expect(screen.getByLabelText(/email/i)).toHaveValue('');
            expect(screen.getByLabelText(/password/i)).toHaveValue('');
            expect(screen.getByLabelText(/role/i)).toHaveTextContent('');
        });
    });
});
