import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt

- unused import
- Doppelung variablen - 2
- TypeError - 3

- 4 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -10
CleanCode: -30
Testumfang: 54,86
 */

const mockUsers: User[] = [
    {
        id: 1,
        name: 'Test User 1',
        email: 'test1@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@test.com',
    role: USER_ROLE.EMPLOYEE,
    password: 'Testpassword2!',
    department: 'Test Department',
};

const mockSetUsers = jest.fn();
const mockFetch = jest.fn();

beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = mockFetch;
});

describe('AddUserFormMittel Component', () => {
    test('renders form elements correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={mockSetUsers} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    test('displays error message when email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), 'Testpassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByText('Add User'));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    test('submits form data successfully and updates user list', async () => {
        mockFetch.mockResolvedValue({
            json: () => Promise.resolve(mockNewUser),
        });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify(mockNewUser),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([...mockUsers, mockNewUser]);
    });

    test('displays error message when API request fails', async () => {
        const errorMessage = 'Failed to create user';
        mockFetch.mockRejectedValue({ message: errorMessage });

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    test('validates password correctly', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Test invalid passwords
        await userEvent.type(passwordInput, 'test'); // Too short
        await userEvent.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'testtest'); // Missing uppercase, digit, special char
        await userEvent.click(submitButton);
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Test valid password
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'Testpassword1!');
        await userEvent.click(submitButton);
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Needs to contain at least one digit')).not.toBeInTheDocument();
        expect(screen.queryByText('Needs to contain at least one special character')).not.toBeInTheDocument();
    });
});
