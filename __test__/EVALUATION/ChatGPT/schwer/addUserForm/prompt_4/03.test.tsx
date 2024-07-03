import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*

- unnecessary waitFor - 2 mal
- clean code: keine variablen erstellt - 3 mal

- 4 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: 0
CleanCode: -25
Testumfang: 35,75
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    query: {},
    push: mockPush,
});

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();
    const setUsers = jest.fn();
    const users: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('should render the component', () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
    });

    it.skip('should handle input changes', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(passwordInput, 'short');

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should handle form submission', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await user.click(submitButton);

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalled();
        });
    });

    it('should show error alert if email is already taken', async () => {
        const existingUsers = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ];
        render(<AddUserFormSchwer setUsers={setUsers} users={existingUsers} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'jane.doe@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should navigate to user page after successful creation if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { shouldRoute: 'true' },
            push: mockPush,
        });

        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        await user.click(submitButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/users?id='));
        });
    });

    it.skip('should close error alert when close icon is clicked', async () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'existing.email@example.com');
        await user.click(submitButton);

        const closeButton = screen.getByLabelText(/close-icon/i);
        await user.click(closeButton);

        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
