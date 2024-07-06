import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- waitFor
- promise
- unnecessary mock

- tyoerror - 4

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        userId: '1',
        name: 'Test User 1',
        email: 'test.user1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];
const mockNewUser: User = {
    userId: '2',
    name: 'Test User 2',
    email: 'test.user2@example.com',
    role: USER_ROLE.ADMIN,
    password: 'TestPassword2!',
    department: 'Test Department',
};

const mockCreateUser = jest.fn();

jest.mock('next/router', () => ({
    useRouter: jest.fn(() => ({
        push: jest.fn(),
        query: {},
    })),
}));

jest.mock('../../services/UserService', () => ({
    createUser: () => mockCreateUser(),
}));

describe('AddUserForm', () => {
    beforeEach(() => {
        mockCreateUser.mockReset();
    });

    it('should render all fields', () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should successfully add a new user with valid data', async () => {
        const setUsersMock = jest.fn();
        mockCreateUser.mockResolvedValue({ userId: '2' });
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(mockCreateUser).toHaveBeenCalledWith(mockNewUser));
        expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, userId: '2' }]);
    });

    it('should show error message when adding a user with an email that already exists', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockUsers[0].password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockUsers[0].role);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible());
        expect(mockCreateUser).not.toHaveBeenCalled();
        expect(setUsersMock).not.toHaveBeenCalled();
    });

    it('should show error messages for invalid password', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        await userEvent.type(screen.getByLabelText('Password'), 'Test1');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        mockCreateUser.mockResolvedValue({ userId: '2' });
        render(<AddUserFormSchwer setUsers={jest.fn()} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByRole('button', { name: 'Add User' }));

        await waitFor(() => expect(mockCreateUser).toHaveBeenCalled());

        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
        expect(screen.getByLabelText('Department')).toHaveValue('');
    });
});
