import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: kein user setup

- unused import
- unnecessary waitFor - 3 mal
- clean code: keine variablen erstellt - 5 mal
- TypeError

- 5 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -50
Testumfang: 57,2
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockRouterPush = jest.fn();
    const mockRouter = {
        query: {},
        push: mockRouterPush,
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component', () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it.skip('should handle input changes', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/password/i);

        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        render(
            <AddUserFormSchwer
                users={[
                    {
                        name: 'Existing User',
                        email: 'existing@example.com',
                        role: USER_ROLE.ADMIN,
                        password: 'Password123!',
                    },
                ]}
                setUsers={mockSetUsers}
            />,
        );

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'existing@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers and reset form on successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it.skip('should navigate to user page on successful submission if shouldRoute is true', async () => {
        mockRouter.query.shouldRoute = 'true';

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it.skip('should show error on failed submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Error' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });
});
