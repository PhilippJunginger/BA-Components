import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*

- unnecessary waitFor - 2 mal
- clean code: keine variablen erstellt - 4 mal

- 4 von 7 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 35,75
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

    it.skip('should handle input changes', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer {...initialProps} />);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByRole('button', { name: /role/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(screen.getByRole('button', { name: /role/i })).toHaveTextContent(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer {...initialProps} />);

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'pass');

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should handle form submission with valid data', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer {...initialProps} />);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByRole('button', { name: /role/i });
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalled();
        });
    });

    it('should show error alert if email is already taken', async () => {
        const user = userEvent.setup();
        const propsWithExistingUser = {
            ...initialProps,
            users: [
                {
                    name: 'Existing User',
                    email: 'existing@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ],
        };
        render(<AddUserFormSchwer {...propsWithExistingUser} />);

        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'existing@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should navigate to user page after successful creation if shouldRoute is true', async () => {
        mockRouter.query = { shouldRoute: 'true' };
        const user = userEvent.setup();
        render(<AddUserFormSchwer {...initialProps} />);

        const nameInput = screen.getByRole('textbox', { name: /name/i });
        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByRole('button', { name: /role/i });
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith(expect.stringContaining('/users?id='));
        });
    });

    it.skip('should close error alert when close icon is clicked', async () => {
        const user = userEvent.setup();
        render(<AddUserFormSchwer {...initialProps} />);

        const emailInput = screen.getByRole('textbox', { name: /email/i });
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'existing@example.com');
        await user.click(submitButton);

        const closeButton = screen.getByLabelText('close-icon');
        await user.click(closeButton);

        expect(screen.queryByText(/es ist ein fehler aufgetreten!/i)).not.toBeInTheDocument();
    });
});
