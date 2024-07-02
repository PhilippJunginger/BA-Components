import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: promise not handled
- critical: Verwendung von fireEvent
- critical: render in beforeEach

- clean code: Doppelung - keine variablen erstellt in zweitem test
- missing assertion
- unnecessary await waitFor - 2


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 2 Redundanz


Best-Practices: -40
CleanCode: -20
Testumfang: 50,1
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    test('renders form elements', () => {
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('displays password error messages', () => {
        const passwordInput = screen.getByLabelText(/password/i);

        fireEvent.change(passwordInput, { target: { value: 'abc' } });
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('prevents submission if email is already taken', async () => {
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await screen.findByRole('alert');
    });

    test.skip('submits form successfully', async () => {
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalledWith(expect.any(Array)));
    });

    test.skip('shows department field when role is not customer', () => {
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('does not show department field when role is customer', () => {
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    test.skip('handles form submission', async () => {
        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalledWith(expect.any(Array)));
    });
});
