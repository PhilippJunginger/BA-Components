import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- waitFor

- setup doppelung
- render Funktion
- doppelung keine Variable - 2
- const

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

    const renderComponent = () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form fields correctly', () => {
        renderComponent();

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('allows input in form fields', async () => {
        renderComponent();
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

    test('displays department field for non-customer roles', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test('submits form with valid data', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            expect.objectContaining({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password123!',
                role: USER_ROLE.CUSTOMER,
            }),
        ]);
    });

    test('shows error for existing email', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'ExistingPass123!',
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

    test('shows error for invalid password', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'weak');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('resets form after successful submission', async () => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.click(screen.getByLabelText(/role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toHaveValue('');
            expect(screen.getByLabelText(/email/i)).toHaveValue('');
            expect(screen.getByLabelText(/password/i)).toHaveValue('');
            expect(screen.getByLabelText(/role/i)).toHaveTextContent('');
        });
    });
});
