import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- unused import
- typerror

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -10
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockNewUser: User = {
    name: 'Test User 2',
    email: 'test2@example.com',
    role: USER_ROLE.CUSTOMER,
    password: 'password123',
};

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn().mockResolvedValue(undefined),
        query: { shouldRoute: 'false' },
    }),
}));

global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '2' }),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('renders form elements correctly', () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);

        expect(nameInput).toHaveValue(mockNewUser.name);
        expect(emailInput).toHaveValue(mockNewUser.email);
        expect(passwordInput).toHaveValue(mockNewUser.password);
        expect(roleSelect).toHaveValue(mockNewUser.role);
    });

    it('validates password and displays error message', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);
        const passwordInput = screen.getByLabelText('Password');
        const invalidPassword = 'short';
        await userEvent.type(passwordInput, invalidPassword);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('displays error message when email is already taken', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={() => {}} />);
        const addUserButton = screen.getByText('Add User');
        await userEvent.click(addUserButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('calls createUser function and updates users when form is submitted', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.click(addUserButton);

        expect(fetch).toHaveBeenCalledTimes(1);
    });
});
