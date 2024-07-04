import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render
- fireEvent
- setup
- waitFor


- unused import
- typeerror
- doppelung keine Variable - 3
- doppelung screen...

- 4 von 4 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -40
CleanCode: -30
Testumfang: 62,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    test('renders all form fields', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('allows input in all fields', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');
        expect(screen.getByLabelText(/password/i)).toHaveValue('Password123!');
        expect(screen.getByLabelText(/role/i)).toHaveValue(USER_ROLE.CUSTOMER);
    });

    test.skip('shows department field for non-customer roles', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test('validates password complexity', async () => {
        await userEvent.type(screen.getByLabelText(/password/i), 'weak');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('checks for existing email', async () => {
        const existingEmail = 'existing@example.com';
        const mockUsersWithExisting = [{ email: existingEmail }];
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsersWithExisting} />);

        await userEvent.type(screen.getByLabelText(/email/i), existingEmail);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('adds new user when form is valid', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'ValidPass1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    password: 'ValidPass1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });

    test.skip('resets form after successful submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'ValidPass1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toHaveValue('');
            expect(screen.getByLabelText(/email/i)).toHaveValue('');
            expect(screen.getByLabelText(/password/i)).toHaveValue('');
            expect(screen.getByLabelText(/role/i)).toHaveValue('');
        });
    });
});
