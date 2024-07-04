import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup
- fireEvent
- render in beforeEach

- doppelung variablen -2

- 3 von 4 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -30
CleanCode: -10
Testumfang: 50
 */

const mockUsers: User[] = [
    {
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        mockSetUsers.mockClear();
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
    });

    it('renders all input fields correctly', () => {
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('validates password correctly and displays error message', async () => {
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(passwordInput, 'short');
        fireEvent.submit(addUserButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('validates email and displays error message if email already exists', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test1@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.submit(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('adds a new user with valid input data', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.mouseDown(roleSelect);
        const employeeOption = screen.getByText(USER_ROLE.EMPLOYEE);
        fireEvent.click(employeeOption);
        fireEvent.submit(addUserButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Test User 2',
                email: 'test2@example.com',
                password: 'Password123!',
                role: USER_ROLE.EMPLOYEE,
            },
        ]);
    });

    it('clears the form after adding a user', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test2@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.submit(addUserButton);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
    });
});
