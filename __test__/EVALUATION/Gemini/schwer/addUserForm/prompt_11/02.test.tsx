import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- waitFor

- tyoerror
- screen

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -10
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        userId: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Password1!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'Password123!',
    role: USER_ROLE.ADMIN,
};

const mockCreateUser = jest.fn();

jest.mock('../../services/apiService', () => ({
    createUser: () => mockCreateUser(),
}));

describe('AddUserForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form correctly', () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should handle input changes correctly', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);

        expect(screen.getByLabelText('Name')).toHaveValue(mockNewUser.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockNewUser.email);
        expect(screen.getByLabelText('Password')).toHaveValue(mockNewUser.password);
        expect(screen.getByLabelText('Role')).toHaveValue(mockNewUser.role);
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        await userEvent.type(screen.getByLabelText('Password'), 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={() => {}} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should submit the form and add a new user', async () => {
        const setUsersMock = jest.fn();
        mockCreateUser.mockResolvedValue({ userId: '2' });

        render(<AddUserFormSchwer users={mockUsers} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        await userEvent.selectOptions(screen.getByLabelText('Role'), mockNewUser.role);
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(mockCreateUser).toHaveBeenCalledWith(mockNewUser);
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, userId: '2' }]);
        });
    });
});
