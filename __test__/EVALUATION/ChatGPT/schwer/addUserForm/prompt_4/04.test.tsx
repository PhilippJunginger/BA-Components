import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PasswordError } from '../../models/passwordError';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*

- unused import
- unnecessary waitFor
- clean code: keine variablen erstellt - 3 mal

- 4 von 7 notwendigen Testumfang erreicht + 4 Redundanz


Best-Practices: 0
CleanCode: -25
Testumfang: 28,6
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

    const initialProps = {
        setUsers: mockSetUsers,
        users: [],
    };

    it.skip('should render the component', () => {
        render(<AddUserFormSchwer {...initialProps} />);
        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
    });

    it('should handle input changes', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/name/i);
        await user.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show password error messages', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'pass');
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should handle role selection', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not customer', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const user = userEvent.setup();

        const roleSelect = screen.getByLabelText(/role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it.skip('should handle form submission', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalled();
        });
    });

    it('should show error alert when email is already taken', async () => {
        const propsWithExistingUser = {
            ...initialProps,
            users: [
                {
                    name: 'Existing User',
                    email: 'existing@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'Password123!',
                },
            ],
        };

        render(<AddUserFormSchwer {...propsWithExistingUser} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should close error alert when close icon is clicked', async () => {
        render(<AddUserFormSchwer {...initialProps} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        const closeButton = screen.getByLabelText(/close-icon/i);
        await user.click(closeButton);

        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
