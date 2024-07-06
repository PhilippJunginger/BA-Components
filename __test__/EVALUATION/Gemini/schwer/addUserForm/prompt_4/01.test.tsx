import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- typerror - 2
- unused import

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 66,8
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
    role: USER_ROLE.EMPLOYEE,
    password: 'password456',
    department: 'Test Department',
};

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        query: { shouldRoute: 'true' },
    })),
}));

const mockFetch = jest.fn();

global.fetch = mockFetch;

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
        });
    });

    it('renders the form with correct initial values', () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

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

    it('validates password correctly', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(passwordInput, 'short');
        await userEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'abcdefgh');
        await userEvent.click(submitButton);

        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
    });

    it('shows department field for non-customer roles', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        const roleSelect = screen.getByLabelText('Role');

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('handles form submission correctly', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.type(departmentInput, mockNewUser.department);
        await userEvent.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify(mockNewUser),
        });

        expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: '2' }]);
    });

    it('handles duplicate email error', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, mockUsers[0].email);
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('handles API errors', async () => {
        mockFetch.mockRejectedValueOnce(new Error('API Error'));

        render(<AddUserFormSchwer setUsers={jest.fn()} users={mockUsers} />);

        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
