import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- clean code: Doppelung von userEvent.setup aufrufen
- clean code: Verwendung von einer render Funktion
- clean code: Keine Variable benutzt für Prüfung von Eingaben

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundanzen

Best-Practices: 0
CleanCode: -15
Testumfang: 75
 */

describe('AddUserFormLeicht Component', () => {
    const initialUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];
    const setUsers = jest.fn();

    const setup = () => render(<AddUserFormLeicht users={initialUsers} setUsers={setUsers} />);

    it('should display validation errors for empty fields', async () => {
        const user = userEvent.setup();
        setup();

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByLabelText(/name/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/email/i)).toHaveAttribute('aria-invalid', 'true');
        expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
    });

    it('should show error for existing email', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    it('should show password validation errors', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'password');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should add a user successfully', async () => {
        const user = userEvent.setup();
        setup();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    it('should display department field for non-customer roles', async () => {
        const user = userEvent.setup();
        setup();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it('should not display department field for customer role', async () => {
        const user = userEvent.setup();
        setup();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });
});
