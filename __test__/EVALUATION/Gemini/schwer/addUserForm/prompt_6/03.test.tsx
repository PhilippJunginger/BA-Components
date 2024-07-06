import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- fireEvent

- variable - 4
- screen
- type error - 3

- 6 von 6 notwendigem Testumfang erreicht + 3 Redundazen


Best-Practices: -10
CleanCode: -40
Testumfang: 75,15
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockSetUsers = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
        query: { shouldRoute: 'false' },
    }),
}));

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByRole('heading', { level: 3, name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeDisabled();
    });

    it('updates the form fields correctly', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('shows password error messages', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test1');

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeVisible();
        expect(screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i)).toBeVisible();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeVisible();
    });

    it('hides password error messages after entering valid password', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'Test1');
        await userEvent.type(passwordInput, 'Test1234!');

        expect(screen.queryByText(/password needs to be 8 characters long/i)).toBeNull();
        expect(screen.queryByText(/needs to contain at least one uppercase and one lowercase letter/i)).toBeNull();
        expect(screen.queryByText(/needs to contain at least one special character/i)).toBeNull();
    });

    it('shows an error message if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@example.com');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form successfully and resets the form fields', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ userId: '2' }),
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: 'Test1234!',
                role: USER_ROLE.ADMIN,
                department: '',
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
                password: 'Test1234!',
                role: USER_ROLE.ADMIN,
                department: '',
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('should redirect if shouldRoute is true', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ userId: '2' }),
        });

        (mockRouterPush as jest.Mock).mockResolvedValueOnce();

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
    });

    it('handles fetch errors gracefully', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('Fetch error'));

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('closes the error alert', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        fireEvent.click(screen.getByRole('button', { name: /add user/i }));
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();

        fireEvent.click(screen.getByLabelText('close-icon'));
        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
