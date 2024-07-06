import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import { PasswordError } from '../../../../../../models/passwordError';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- unnecessary mock

- unused import
- type error - 3

- 6 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 41,75
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test.user.1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockNewUser: User = {
    id: '2',
    name: 'Test User 2',
    email: 'test.user.2@example.com',
    role: USER_ROLE.ADMIN,
    password: 'TestPassword2!',
    department: 'Test Department',
};

const mockCheckEnteredPassword = jest.fn<PasswordError, [string]>().mockReturnValue({
    digit: false,
    lowercaseLetter: false,
    uppercaseLetter: false,
    specialChar: false,
    minLength: false,
});

const mockCreateUser = jest.fn(async (): Promise<{ userId: string }> => {
    return { userId: '2' };
});

jest.mock('../models/passwordError', () => ({
    PasswordError: jest.fn().mockReturnValue({
        checkEnteredPassword: mockCheckEnteredPassword,
    }),
}));

jest.mock('next/router', () => ({
    useRouter: jest.fn().mockReturnValue({
        push: jest.fn(),
        query: {
            shouldRoute: 'false',
        },
    }),
}));

global.fetch = jest.fn(async () => ({
    json: async () => ({ userId: '2' }),
    status: 200,
})) as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        mockCreateUser.mockClear();
        mockCheckEnteredPassword.mockClear();
    });

    test('renders form elements correctly', () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('submits form with valid data', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.ADMIN]);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        expect(mockCreateUser).toHaveBeenCalledTimes(1);
        expect(mockCreateUser).toHaveBeenCalledWith();
        expect(setUsersMock).toHaveBeenCalledTimes(1);
        expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: '2' }]);
    });

    test('shows error message if email is already taken', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.CUSTOMER]);
        await userEvent.click(screen.getByText('Add User'));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        expect(mockCreateUser).not.toHaveBeenCalled();
    });

    test('validates password correctly', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Test invalid passwords
        await userEvent.type(passwordInput, 'Test1');
        await userEvent.click(submitButton);
        expect(mockCheckEnteredPassword).toHaveBeenCalledWith('Test1');

        // Test valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'TestPassword1!');
        await userEvent.click(submitButton);
        expect(mockCheckEnteredPassword).toHaveBeenCalledWith('TestPassword1!');
    });
});
