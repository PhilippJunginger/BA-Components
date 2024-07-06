import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- require import of userEvent

- variable - 3
- sreen
- unused import
- type error - 3
- multiple clear instead of clearAllMocks

- 6 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -45
Testumfang: 75,15
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockImplementation(() => ({
            push: mockPush,
            query: { shouldRoute: 'false' },
        }));

        mockSetUsers.mockClear();
        mockPush.mockClear();
    });

    test('renders form fields with correct labels', () => {
        render(<AddUserFormSchwer users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    test('submits form data with valid input', async () => {
        const userEvent = require('@testing-library/user-event').default;
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '2' }),
                status: 200,
            }),
        );

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'newuser@test.com');
        await userEvent.type(screen.getByLabelText('Password'), 'NewPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@test.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'NewPassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    test('shows error message when email is already taken', async () => {
        global.fetch = jest.fn(() => Promise.reject({ message: 'Error: Email already taken' }));

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Test User 2');
        await userEvent.type(screen.getByLabelText('Email'), 'test1@test.com'); // Same email as mockUsers[0]
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword2!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    test('displays password error messages', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'ShortPassword1!');

        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one digit')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one uppercase and one lowercase letter')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one special character')).toBeNull();
    });

    test('shows and hides department field based on role', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    test('redirects after successful user creation if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockImplementation(() => ({
            push: mockPush,
            query: { shouldRoute: 'true' },
        }));

        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '2' }),
                status: 200,
            }),
        );

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'newuser@test.com');
        await userEvent.type(screen.getByLabelText('Password'), 'NewPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
    });
});
