import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Kein instantiierung von userEvent.setup()

- clean code: unused import
- clean code: render Funktion erstellt
- clean code: Doppelung keine Variable erstellt

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 1 Redundanzen

Best-Practices: -10
CleanCode: -15
Testumfang: 87.5
 */

const mockSetUsers = jest.fn();

const renderComponent = () => render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    test('renders form fields correctly', () => {
        renderComponent();

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    test('shows password error for invalid password', async () => {
        renderComponent();

        await userEvent.type(screen.getByLabelText(/Password/i), 'invalid');
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('shows email error for duplicate email', async () => {
        const existingUsers = [
            { name: 'Existing User', email: 'existing@test.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/Email/i), 'existing@test.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user data on valid submission', async () => {
        renderComponent();

        await userEvent.type(screen.getByLabelText(/Name/i), 'New User');
        await userEvent.type(screen.getByLabelText(/Email/i), 'new@test.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'New User', email: 'new@test.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ]);
    });

    test.skip('shows department field for ADMIN and EMPLOYEE roles', async () => {
        renderComponent();

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not show department field for CUSTOMER role', async () => {
        renderComponent();

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
