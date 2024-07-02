import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- critical: Verwendung von fireEvent
- critical: promises not handled from userEvent
- critical: verwendung von render in beforeEach

- clean code: Keine Variable benutzt für Prüfung von Eingaben
- clean code: Doppelung von screen... aufrufen
- clean code: unnecessary awaiting of element line: 67

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme +1 Redundanzen

Best-Practices: -30
CleanCode: -15
Testumfang: 87,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);
    });

    test('renders form fields correctly', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('displays password error message for invalid password', async () => {
        await userEvent.type(screen.getByLabelText(/Password/i), 'invalid');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('displays email error message for duplicate email', async () => {
        const existingUser: User = {
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={[existingUser]} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user on valid form submission', async () => {
        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await screen.findByLabelText(/Name/i); // Wait for form to reset

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ]);
    });

    test.skip('renders department field when role is ADMIN or EMPLOYEE', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field when role is CUSTOMER', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
