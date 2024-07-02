import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: not handling promises from UserEvent
- critical: not using userEvent.setup()
- critical: Verwendung von render in beforeEach

- clean code: Keine Variable benutzt für Prüfung von Eingaben

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundanzen

Best-Practices: -30
CleanCode: -5
Testumfang: 87,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
    });

    test('renders form fields correctly', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
    });

    test('displays password validation error', async () => {
        await userEvent.type(screen.getByLabelText(/password/i), 'weakpass');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test('displays email already exists error', async () => {
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        expect(await screen.findByText(/email already exists!/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers with new user when form is valid', async () => {
        await userEvent.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await screen.findByLabelText(/name/i); // Wait for form to reset

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ]);
    });

    test.skip('renders department field when role is not customer', async () => {
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(await screen.findByLabelText(/department/i)).toBeInTheDocument();
    });

    test('does not render department field when role is customer', () => {
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });
});
