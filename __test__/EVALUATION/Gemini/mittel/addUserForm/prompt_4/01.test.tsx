import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- fireEvent
- tests without assertions - 3

- Doppelung variablen - 2
- TypeError - 1
- unnecessary mock

- 3 von 6 notwendigem Testumfang erreicht + 4 Redudndanz


Best-Practices: -60
CleanCode: -20
Testumfang: 16,7
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword123!',
    },
];

const mockSetUsers = jest.fn();

jest.mock('../../services/api', () => ({
    createUser: jest.fn(),
}));

describe('AddUserFormMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
    });

    it('displays the correct title', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it('updates the new user state on input change', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox', { name: 'Role' });

        await userEvent.type(nameInput, 'Test Name');
        await userEvent.type(emailInput, 'test@email.com');
        await userEvent.type(passwordInput, 'TestPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test Name');
        expect(emailInput).toHaveValue('test@email.com');
        expect(passwordInput).toHaveValue('TestPassword123!');
        expect(screen.getByDisplayValue(USER_ROLE.ADMIN)).toBeInTheDocument();
    });

    it('displays an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(emailInput, 'test@test.com');
        fireEvent.submit(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('calls the createUser function on submit', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox', { name: 'Role' });
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@email.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        fireEvent.submit(submitButton);

        // Add assertions to verify the createUser function was called with the correct data
    });

    it('updates the users list after successful user creation', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox', { name: 'Role' });
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@email.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        fireEvent.submit(submitButton);

        // Add assertions to verify that the setUsers function was called with the updated user list
    });

    it('displays an error message if user creation fails', async () => {
        // Mock the createUser function to throw an error
        // ...

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByRole('combobox', { name: 'Role' });
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@email.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        fireEvent.submit(submitButton);

        // Add assertions to verify that the error message is displayed
    });
});
