import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- very critical: not using UserEvent at all

- clean code: Verwendung einer render Funktion
- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal
- clean code: unused import
- clean code: Doppelung von screen... aufrufen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundanzen

Best-Practices: -30
CleanCode: -20
Testumfang: 87,5
 */

const renderComponent = (props = {}) => {
    const defaultProps = {
        users: [],
        setUsers: jest.fn(),
    };
    return render(<AddUserFormLeicht {...defaultProps} {...props} />);
};

describe('AddUserFormLeicht', () => {
    test('renders form elements correctly', () => {
        renderComponent();

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByText(/Add User/i)).toBeInTheDocument();
    });

    test('shows password error messages on invalid password', () => {
        renderComponent();

        const passwordInput = screen.getByLabelText(/Password/i);
        fireEvent.change(passwordInput, { target: { value: '123' } });

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('shows email error message on duplicate email', () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ];
        renderComponent({ users: existingUsers });

        const emailInput = screen.getByLabelText(/Email/i);
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user on valid form submission', () => {
        const setUsersMock = jest.fn();
        renderComponent({ setUsers: setUsersMock });

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsersMock).toHaveBeenCalledWith([
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ]);
    });

    test.skip('renders department field for non-customer roles', () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    test.skip('does not render department field for customer role', () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    test.skip('resets form fields after successful submission', () => {
        renderComponent();

        fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.ADMIN } });

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });
});
