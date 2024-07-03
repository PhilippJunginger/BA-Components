import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung fireEvent
- critical: promises not handled

- clean code: keine variablen erstellt - 3 mal


- 4 von 7 notwendigen Testumfang erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -15
Testumfang: 50,05
*/

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: () => ({
        query: {},
        push: jest.fn(),
    }),
}));

const mockSetUsers = jest.fn();

describe('AddUserFormSchwer', () => {
    const initialProps = {
        setUsers: mockSetUsers,
        users: [],
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders form fields correctly', () => {
        render(<AddUserFormSchwer {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('validates password correctly and shows error messages', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);

        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        });

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'NoDigitPassword!');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        });

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'NoSpecialChar1');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    test.skip('displays error when email is already taken', async () => {
        const propsWithUsers = {
            ...initialProps,
            users: [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' }],
        };

        render(<AddUserFormSchwer {...propsWithUsers} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    test.skip('creates a user successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith(
                expect.arrayContaining([
                    expect.objectContaining({ name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN }),
                ]),
            );
        });
    });

    test.skip('routes to user page after successful creation when shouldRoute is true', async () => {
        const router = useRouter();
        router.query = { shouldRoute: 'true' };

        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({ userId: '123' }),
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer {...initialProps} />);

        await userEvent.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await userEvent.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await userEvent.type(screen.getByLabelText(/Password/i), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(router.push).toHaveBeenCalledWith('http://localhost:3000/users?id=123');
        });
    });
});
