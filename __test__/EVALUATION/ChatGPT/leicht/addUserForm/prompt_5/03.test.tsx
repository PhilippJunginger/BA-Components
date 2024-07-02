import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- very critical: nur fireEvent verwendet

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 1 Redundanzen

Best-Practices: -10
CleanCode: -15
Testumfang: 87.5
 */

describe('AddUserFormLeicht component', () => {
    test('renders form elements', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test('displays password error for invalid password', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);

        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: '123' } });
        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('displays email error for duplicate email', () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ];
        render(<AddUserFormLeicht users={existingUsers} setUsers={jest.fn()} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
    });

    test.skip('resets form on successful submission', () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormLeicht users={[]} setUsers={setUsersMock} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.EMPLOYEE } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.EMPLOYEE,
                password: 'Password1!',
            },
        ]);

        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
    });

    test.skip('displays department field when role is not customer', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);

        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('does not display department field when role is customer', () => {
        render(<AddUserFormLeicht users={[]} setUsers={jest.fn()} />);

        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });
});
