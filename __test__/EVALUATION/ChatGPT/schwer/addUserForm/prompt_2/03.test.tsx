import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: Verwendung von fireEvent
- very critical: keine Verwendung von UserEvent

- clean code: keine variablen erstellt - 3 mal
- unused import

- 4 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -30
CleanCode: -20
Testumfang: 50,05
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();

    const mockUsers: User[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
    ];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({ query: { shouldRoute: 'false' }, push: jest.fn() });
    });

    it.skip('should render the component correctly', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it.skip('should handle input changes', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        expect(nameInput).toHaveValue('Jane Doe');

        const emailInput = screen.getByLabelText(/email/i);
        fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
        expect(emailInput).toHaveValue('jane@example.com');

        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: 'Password2!' } });
        expect(passwordInput).toHaveValue('Password2!');

        const roleSelect = screen.getByLabelText(/role/i);
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.MANAGER } });
        expect(roleSelect).toHaveValue(USER_ROLE.MANAGER);
    });

    it('should show password validation errors', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/password/i);
        fireEvent.change(passwordInput, { target: { value: 'short' } });

        expect(await screen.findByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
    });

    it.skip('should handle form submission and call setUsers', async () => {
        const newUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue({ userId: '123' }),
            status: 200,
        });

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: newUser.name } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: newUser.email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: newUser.password } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: newUser.role } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, newUser]));
    });

    it('should show error alert when email is already taken', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should close error alert when close button is clicked', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        fireEvent.click(screen.getByLabelText(/close-icon/i));
        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });

    it.skip('should handle navigation when shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({ query: { shouldRoute: 'true' }, push: jest.fn() });

        const newUser = {
            name: 'Jane Doe',
            email: 'jane@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        global.fetch = jest.fn().mockResolvedValue({
            json: jest.fn().mockResolvedValue({ userId: '123' }),
            status: 200,
        });

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: newUser.name } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: newUser.email } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: newUser.password } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: newUser.role } });

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, newUser]));
        await waitFor(() => expect(useRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123'));
    });
});
