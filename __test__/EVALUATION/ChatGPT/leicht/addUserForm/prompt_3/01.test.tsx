import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical error: Verwendung von fireEvent
- critical error: userEvent promise not handled
- critical error: did not instantiate userEvent.setup()

- komplizierte Verwendung von initialProps
- Doppelung keine Variable erstellt

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -10
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    test('renders the form with initial state', () => {
        render(<AddUserFormLeicht {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test.skip('handles input changes', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Name/i)).toHaveValue('John Doe');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('john.doe@example.com');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('Password123!');
        expect(screen.getByLabelText(/Role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    test('shows password error for invalid password', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/Password/i), 'invalid');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('shows email error if email already exists', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        };
        render(<AddUserFormLeicht {...initialProps} users={[existingUser]} />);

        await userEvent.type(screen.getByLabelText(/Email/i), 'existing@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user on valid form submission', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password123!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john.doe@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
            },
        ]);
    });

    test.skip('renders department field when role is not customer', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field when role is customer', async () => {
        render(<AddUserFormLeicht {...initialProps} />);

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
