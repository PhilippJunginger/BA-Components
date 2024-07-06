import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- unused import
- type error - 2

- 4 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 41,75
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockNewUser: User = {
    name: 'Jane Doe',
    email: 'jane.doe@test.com',
    role: USER_ROLE.ADMIN,
    password: 'password123',
    department: 'IT',
};

const mockSetUsers = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
        query: {
            shouldRoute: 'false',
        },
    }),
}));

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('updates the user state on input change', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);

        expect(nameInput).toHaveValue(mockNewUser.name);
        expect(emailInput).toHaveValue(mockNewUser.email);
        expect(passwordInput).toHaveValue(mockNewUser.password);
    });

    it('validates password input and shows error message', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const invalidPassword = 'pass';

        await userEvent.type(passwordInput, invalidPassword);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('selects the correct role from the dropdown', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);

        const adminOption = screen.getByText(USER_ROLE.ADMIN);
        await userEvent.click(adminOption);

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('shows department field for non-customer roles', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);

        const adminOption = screen.getByText(USER_ROLE.ADMIN);
        await userEvent.click(adminOption);

        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('submits the form with valid data', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                json: () => Promise.resolve({ userId: '2' }),
                status: 200,
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.click(roleSelect);
        const adminOption = screen.getByText(USER_ROLE.ADMIN);
        await userEvent.click(adminOption);
        await userEvent.type(departmentInput, mockNewUser.department);

        await userEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, password: mockNewUser.password }]);
    });

    it('shows an error message if user creation fails', async () => {
        global.fetch = jest.fn(() =>
            Promise.reject({
                message: 'User creation failed',
            }),
        ) as jest.Mock;

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.click(roleSelect);
        const adminOption = screen.getByText(USER_ROLE.CUSTOMER);
        await userEvent.click(adminOption);

        await userEvent.click(submitButton);

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
