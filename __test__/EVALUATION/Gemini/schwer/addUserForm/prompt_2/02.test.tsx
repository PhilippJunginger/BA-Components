import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- fireEvent
- parsing error

- typerror

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -30
CleanCode: -5
Testumfang: 66,8
 */


const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    role: USER_ROLE.EMPLOYEE,
    password: 'NewPassword123!',
    department: 'Test Department',
};

const mockSetUsers = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        query: { shouldRoute: 'false' },
        push: mockRouterPush,
    }),
}));

// Mock the fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: 'newUserId' }),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department');

        // Type into input fields
        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);

        // Select role
        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText(USER_ROLE.EMPLOYEE));

        // Type into department input (should be visible now)
        await userEvent.type(departmentInput, mockNewUser.department);

        // Assertions
        expect(nameInput).toHaveValue(mockNewUser.name);
        expect(emailInput).toHaveValue(mockNewUser.email);
        expect(passwordInput).toHaveValue(mockNewUser.password);
        expect(screen.getByDisplayValue(USER_ROLE.EMPLOYEE)).toBeVisible();
        expect(departmentInput).toHaveValue(mockNewUser.department);
    });

    it('validates password correctly', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Invalid password
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'ValidPassword1!');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });

    it('handles user creation successfully', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({ ...mockNewUser, role: USER_ROLE.CUSTOMER }), // Role should be updated
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            { ...mockNewUser, role: USER_ROLE.CUSTOMER },
        ]);
    });

    it('handles user creation error', async () => {
        const mockError = new Error('User creation failed');
        global.fetch = jest.fn(() => Promise.reject(mockError)) as jest.Mock;

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('handles email already taken error', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Try to add user with same email as mockUsers[0]
        await userEvent.type(emailInput, mockUsers[0].email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.click(submitButton);

        // Expect error to be displayed
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('redirects after successful user creation when shouldRoute is true', async () => {
        (
            (jest.spyOn(require('next/router'), 'useRouter') as jest.SpyInstance
            ).mockReturnValue({
                query: { shouldRoute: 'true' },
                push: mockRouterPush,
            });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=newUserId');
    });
});