import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: userEvent.setup fehlt
- critical: assertions waitFor
- critical: Verwendung fireEvent


- clean code: screen...
- clean code: keine variablen erstellt - 3 mal
- TypeError
- unnötige waitFor - 3 mal
- render Funktion

- 5 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: -30
CleanCode: -45
Testumfang: 64,35
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

    it('should show password error messages when password is invalid', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/Password/i);

        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should show error message if email is already taken', async () => {
        const existingUsers = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN }];
        renderComponent(existingUsers);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('should call setUsers and reset form on successful user creation', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        renderComponent();

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
            expect(screen.getByLabelText(/Name/i)).toHaveValue('');
            expect(screen.getByLabelText(/Email/i)).toHaveValue('');
            expect(screen.getByLabelText(/Password/i)).toHaveValue('');
            expect(screen.getByLabelText(/Role/i)).toHaveValue('');
        });
    });

    it.skip('should navigate to user page if shouldRoute is true', async () => {
        mockRouter.query.shouldRoute = 'true';
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        renderComponent();

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });

    it.skip('should show department field if role is not CUSTOMER', async () => {
        renderComponent();

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('should not show department field if role is CUSTOMER', async () => {
        renderComponent();

        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
