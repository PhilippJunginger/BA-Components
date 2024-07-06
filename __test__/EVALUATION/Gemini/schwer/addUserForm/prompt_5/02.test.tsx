import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- userEvent setup
- very very critical: mocking component import, wrong component name

- variable - 2
- typerror - 2

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -20
Testumfang: 50,1
 */

const mockedUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test.user1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockedCreateUser = jest.fn();
jest.mock('../app/users/add-user-form', () => {
    return {
        __esModule: true,
        default: (props: any) => {
            return <AddUserForm {...props} createUser={mockedCreateUser} />;
        },
    };
});

describe('AddUserForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all fields', () => {
        render(<AddUserForm users={[]} setUsers={() => {}} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should successfully add a new user with valid input', async () => {
        const setUsersMock = jest.fn();
        mockedCreateUser.mockResolvedValue({ userId: '2' });
        render(<AddUserForm users={mockedUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test.user2@example.com');
        await userEvent.type(passwordInput, 'TestPassword2!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(mockedCreateUser).toHaveBeenCalledWith();
        expect(setUsersMock).toHaveBeenCalledWith([
            ...mockedUsers,
            {
                id: '2',
                name: 'Test User 2',
                email: 'test.user2@example.com',
                password: 'TestPassword2!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should show an error message if email is already taken', async () => {
        const setUsersMock = jest.fn();
        mockedCreateUser.mockResolvedValue({ userId: '2' });
        render(<AddUserForm users={mockedUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test.user1@example.com');
        await userEvent.type(passwordInput, 'TestPassword2!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        expect(mockedCreateUser).not.toHaveBeenCalled();
    });

    it('should show password validation errors', async () => {
        render(<AddUserForm users={[]} setUsers={() => {}} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(passwordInput, 'Test1');
        await userEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        const setUsersMock = jest.fn();
        mockedCreateUser.mockResolvedValue({ userId: '2' });
        render(<AddUserForm users={mockedUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, 'test.user2@example.com');
        await userEvent.type(passwordInput, 'TestPassword2!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
    });

    it('should render the department field if the role is not customer', async () => {
        render(<AddUserForm users={[]} setUsers={() => {}} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
