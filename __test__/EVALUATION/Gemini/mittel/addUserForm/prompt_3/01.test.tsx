import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent
- userEvent.setup

- TypeError
- userEvent.setuo doppelung
- Doppelung variablen - 4
- unnecessaey mock

- 4 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -35
Testumfang: 50,1
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword123!',
    },
];

const mockSetUsers = jest.fn();

jest.mock('../../services/api-service', () => ({
    createUser: jest.fn(),
}));

describe('AddUserFormMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with initial state', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('updates the new user state on input change', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'Test Name' } });
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('Test Name');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('shows password error messages for invalid password', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        fireEvent.change(passwordInput, { target: { value: 'Test1' } });
        fireEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('shows error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(emailInput, 'test@test.com');
        fireEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('submits the form with valid data and updates user list', async () => {
        const createUserMock = jest.fn().mockResolvedValue({ id: 2 });
        // @ts-ignore
        require('../../services/api-service').createUser = createUserMock;

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        expect(createUserMock).toHaveBeenCalledWith({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'NewPassword123!',
            role: USER_ROLE.CUSTOMER,
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });

    it('shows error message if create user request fails', async () => {
        const createUserMock = jest.fn().mockRejectedValue(new Error('Failed to create user'));
        // @ts-ignore
        require('../../services/api-service').createUser = createUserMock;

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(submitButton);

        expect(createUserMock).toHaveBeenCalledWith({
            name: 'New User',
            email: 'newuser@example.com',
            password: 'NewPassword123!',
            role: USER_ROLE.CUSTOMER,
        });

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });
});
