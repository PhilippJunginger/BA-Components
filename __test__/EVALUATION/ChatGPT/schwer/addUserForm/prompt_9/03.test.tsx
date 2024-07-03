import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: userEvent.setup nicht verwendet
- critical: fireEvent verwendet
- cirtical: promises not handled
- critical: assertiions waitFor

- clean code: keine variablen erstellt -
- TypeError

- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -10
Testumfang: 50,05
*/

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
    query: {},
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('AddUserFormSchwer', () => {
    let setUsers: jest.Mock;
    let users: User[];

    beforeEach(() => {
        setUsers = jest.fn();
        users = [];
        mockRouter.query = {};
    });

    const renderComponent = () => {
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
    };

    test('renders form elements', () => {
        renderComponent();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('shows password error messages', async () => {
        renderComponent();
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'weakpass');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
            expect(
                screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    test.skip('adds user successfully', async () => {
        users = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' }];
        const newUser = { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '2' }),
            }),
        ) as jest.Mock;

        renderComponent();
        await userEvent.type(screen.getByLabelText(/name/i), newUser.name);
        await userEvent.type(screen.getByLabelText(/email/i), newUser.email);
        await userEvent.type(screen.getByLabelText(/password/i), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText(/role/i), newUser.role);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([...users, newUser]);
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    test('shows error when email is already taken', async () => {
        users = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' }];
        renderComponent();
        await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    test.skip('routes to user page after successful addition if shouldRoute is true', async () => {
        mockRouter.query.shouldRoute = 'true';
        users = [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' }];
        const newUser = { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '2' }),
            }),
        ) as jest.Mock;

        renderComponent();
        await userEvent.type(screen.getByLabelText(/name/i), newUser.name);
        await userEvent.type(screen.getByLabelText(/email/i), newUser.email);
        await userEvent.type(screen.getByLabelText(/password/i), newUser.password);
        await userEvent.selectOptions(screen.getByLabelText(/role/i), newUser.role);
        fireEvent.submit(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith([...users, newUser]);
            expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
        });
    });
});
