import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: assertions waitFor

- clean code: Doppelung userEvent.setup
- clean code: Doppelung screen
- unnötiges waitFor - 2 mal
- clean code: keine variablen erstellt - 2 mal
- render Funktion
- unused import
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -10
CleanCode: -45
Testumfang: 42,9
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

    const renderComponent = (users = []) => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={users} />);
    };

    it('should render the form fields correctly', () => {
        renderComponent();

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show entered values in the form fields', async () => {
        const user = userEvent.setup();
        renderComponent();

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show password error messages', async () => {
        const user = userEvent.setup();
        renderComponent();

        const passwordInput = screen.getByLabelText(/Password/i);

        await user.type(passwordInput, 'short');

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        const user = userEvent.setup();
        const existingUsers = [{ name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN }];
        renderComponent(existingUsers);

        const emailInput = screen.getByLabelText(/Email/i);
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await user.type(emailInput, 'jane.doe@example.com');
        await user.click(submitButton);

        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers and reset form on successful submission', async () => {
        const user = userEvent.setup();
        const newUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password123!',
        };
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({ userId: '123' }),
        } as any);

        renderComponent();

        await user.type(screen.getByLabelText(/Name/i), newUser.name);
        await user.type(screen.getByLabelText(/Email/i), newUser.email);
        await user.type(screen.getByLabelText(/Password/i), newUser.password);
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith(expect.arrayContaining([newUser]));
            expect(screen.getByLabelText(/Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        });

        mockFetch.mockRestore();
    });

    it.skip('should navigate to user page on successful submission if shouldRoute is true', async () => {
        const user = userEvent.setup();
        mockRouter.query.shouldRoute = 'true';
        const newUser = {
            name: 'John Doe',
            email: 'john.doe@example.com',
            role: USER_ROLE.ADMIN,
            password: 'Password123!',
        };
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: jest.fn().mockResolvedValue({ userId: '123' }),
        } as any);

        renderComponent();

        await user.type(screen.getByLabelText(/Name/i), newUser.name);
        await user.type(screen.getByLabelText(/Email/i), newUser.email);
        await user.type(screen.getByLabelText(/Password/i), newUser.password);
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });

        mockFetch.mockRestore();
    });
});
