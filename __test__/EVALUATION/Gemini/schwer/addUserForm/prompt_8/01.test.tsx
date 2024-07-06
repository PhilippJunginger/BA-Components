import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- variable - 2

- 4 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -10
CleanCode: -10
Testumfang: 75,15
 */

describe('AddUserFormSchwer Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'Test User', email: 'test@example.com', role: USER_ROLE.CUSTOMER, password: 'Test1234!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all input fields', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update user details on input change', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Test5678!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User 2');
        expect(emailInput).toHaveValue('test2@example.com');
        expect(passwordInput).toHaveValue('Test5678!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test1');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display error message for duplicate email', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user on submit', async () => {
        const mockCreateUser = jest.fn().mockResolvedValue({ userId: 'testId' });
        (global.fetch as jest.Mock) = jest.fn().mockResolvedValue({
            json: () => {
                return { userId: 'testId' };
            },
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Test5678!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'Test5678!',
                role: USER_ROLE.ADMIN,
            },
        ]);
    });
});
