import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- render
- setup


- doppelung keine Variable - 2
- doppelung screen... - 2
- const

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -25
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [];

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

    test.skip('validates email uniqueness', async () => {
        const existingUser: User = {
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password2@');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('validates password complexity', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'weakpass');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    test.skip('adds a new user successfully', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'StrongPass1!' },
        ]);
    });

    test.skip('displays department field for non-customer roles', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(await screen.findByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await waitFor(() => {
            expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
        });
    });

    test.skip('resets form after successful submission', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'StrongPass1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toHaveValue('');
    });
});
