import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- fireEvent


- doppelung variable - 4
- typerror

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -25
Testumfang: 50,1
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Password1!',
    },
];

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockImplementation(() => ({
            push: jest.fn(),
            query: {},
        }));
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Create new User');
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    it('validates password and displays error messages', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(passwordInput, 'Test1');
        fireEvent.submit(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('displays an error message if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test1@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.submit(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form with correct values and updates user list', async () => {
        const mockSetUsers = jest.fn();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.submit(submitButton);

        // Mock the fetch call to return a successful response
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
        });

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

    it('redirects to the user details page after successful user creation', async () => {
        (useRouter as jest.Mock).mockImplementation(() => ({
            push: jest.fn(),
            query: { shouldRoute: 'true' },
        }));

        const mockSetUsers = jest.fn();
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.submit(submitButton);

        // Mock the fetch call to return a successful response
        global.fetch = jest.fn().mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
        });

        expect(useRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
    });
});
