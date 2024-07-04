import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt

- unused import
- unnecessary mock
- TypeError

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -10
CleanCode: -15
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    role: USER_ROLE.ADMIN,
    password: 'password123!',
    department: 'IT',
};

const mockSetUsers = jest.fn();

jest.mock('../../services/api', () => ({
    createUser: jest.fn().mockResolvedValue({ id: 2, ...mockNewUser }),
}));

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without errors', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it('updates new user state on input change', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const departmentInput = screen.getByLabelText('Department') as HTMLInputElement;

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.type(departmentInput, mockNewUser.department);

        expect(nameInput.value).toBe(mockNewUser.name);
        expect(emailInput.value).toBe(mockNewUser.email);
        expect(passwordInput.value).toBe(mockNewUser.password);
        expect(roleSelect.value).toBe(mockNewUser.role);
        expect(departmentInput.value).toBe(mockNewUser.department);
    });

    it('validates password and shows error message', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        // Invalid password
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.click(submitButton);

        expect(screen.queryByText('Password needs to be 8 characters long')).toBeNull();
    });

    it('shows error message for duplicate email', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, mockUsers[0].email);
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits form, creates user and updates user list', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, id: expect.any(Number) }]);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
    });
});
