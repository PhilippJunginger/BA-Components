import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- critical: Verwendung von fireEvent
. critical: promises not handled
- critical: userEvent.setup() not used

- clean code: keine variablen erstellt - 2 mal

- 4 von 7 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -10
Testumfang: 42,9
*/

// Mock next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '123' }),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormSchwer', () => {
    const mockSetUsers = jest.fn();
    const mockUsers: User[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
    ];

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            query: {},
            push: jest.fn(),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders the component', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('handles input changes', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByDisplayValue('Jane Doe')).toBeInTheDocument();
        expect(screen.getByDisplayValue('jane.doe@example.com')).toBeInTheDocument();
        expect(screen.getByDisplayValue('Password1!')).toBeInTheDocument();
        expect(screen.getByDisplayValue(USER_ROLE.ADMIN)).toBeInTheDocument();
    });

    test('shows error if email is already taken', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await screen.findByRole('alert');
    });

    test('shows password validation errors', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Password'), 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    test('submits the form and calls setUsers', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalled());
    });

    test('navigates to user page on successful creation if shouldRoute is true', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            query: { shouldRoute: 'true' },
            push: jest.fn(),
        });

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'Password1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        fireEvent.submit(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(useRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=123'));
    });
});
