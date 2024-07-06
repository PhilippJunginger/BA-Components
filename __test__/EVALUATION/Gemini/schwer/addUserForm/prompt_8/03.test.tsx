import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- variable - 3
. tyoerror - 2

- 3 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 25,05
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

const mockSetUsers = jest.fn();

jest.mock('next/router', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            query: { shouldRoute: 'false' },
        };
    },
}));

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with correct input fields', () => {
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

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'test12345');

        expect(nameInput).toHaveValue('Test User 2');
        expect(emailInput).toHaveValue('test2@example.com');
        expect(passwordInput).toHaveValue('test12345');
    });

    it('validates password and shows error messages', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Submit with empty password
        await userEvent.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Submit with invalid password
        await userEvent.type(passwordInput, 'test');
        await userEvent.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Submit with valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.click(submitButton);
        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one digit')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one uppercase and one lowercase letter')).toBeNull();
        expect(screen.queryByText('Needs to contain at least one special character')).toBeNull();
    });

    it('selects the correct user role', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.click(roleSelect);
        const adminOption = screen.getByText(USER_ROLE.ADMINISTRATOR);
        await userEvent.click(adminOption);

        expect(roleSelect).toHaveValue(USER_ROLE.ADMINISTRATOR);
    });

    it('shows an error message if email is already taken', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);
        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(emailInput, 'test1@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form with valid data and calls createUser', async () => {
        const mockCreateUser = jest.fn().mockResolvedValue({ userId: '2' });
        // @ts-ignore
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
        });

        render(<AddUserFormSchwer users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.click(roleSelect);
        const customerOption = screen.getByText(USER_ROLE.CUSTOMER);
        await userEvent.click(customerOption);
        await userEvent.click(submitButton);

        expect(mockCreateUser).toHaveBeenCalledWith();
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                id: '2',
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'Test1234!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });
});
