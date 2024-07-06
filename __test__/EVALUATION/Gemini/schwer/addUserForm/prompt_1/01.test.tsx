import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent.setup missing
- fireEvent
- ts ignore comment

- doppelung keine Variable
- doppelung screen
- typeError - 4

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -30
CleanCode: -30
Testumfang: 50,1
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const mockedUsedRouter = useRouter;

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test.user1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'new.user@example.com',
    role: USER_ROLE.EMPLOYEE,
    password: 'TestPassword123!',
    department: 'Test Department',
};

describe('AddUserForm', () => {
    beforeEach(() => {
        mockedUsedRouter.mockImplementation(() => ({
            push: jest.fn(),
            query: {},
        }));
        jest.spyOn(global, 'fetch').mockResolvedValue({
            status: 200,
            json: () => Promise.resolve({ userId: '2' }),
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should render the form correctly', () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should handle user input correctly', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.EMPLOYEE } });

        expect(screen.getByLabelText('Name')).toHaveValue(mockNewUser.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockNewUser.email);
        expect(screen.getByLabelText('Password')).toHaveValue(mockNewUser.password);
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={[]} />);

        const invalidPassword = 'short';
        await userEvent.type(screen.getByLabelText('Password'), invalidPassword);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={jest.fn()} users={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Name'), mockUsers[0].name);
        await userEvent.type(screen.getByLabelText('Email'), mockUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user on submit', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={[]} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.EMPLOYEE } });
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify(mockNewUser),
        });

        expect(setUsersMock).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'new.user@example.com',
                role: 'EMPLOYEE',
                password: 'TestPassword123!',
                department: 'Test Department',
            },
        ]);
    });

    it('should redirect after adding a new user if shouldRoute is true', async () => {
        mockedUsedRouter.mockImplementation(() => ({
            push: jest.fn(),
            query: { shouldRoute: 'true' },
        }));

        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={[]} />);

        await userEvent.type(screen.getByLabelText('Name'), mockNewUser.name);
        await userEvent.type(screen.getByLabelText('Email'), mockNewUser.email);
        await userEvent.type(screen.getByLabelText('Password'), mockNewUser.password);
        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.EMPLOYEE } });
        await userEvent.type(screen.getByLabelText('Department'), mockNewUser.department);
        await userEvent.click(screen.getByText('Add User'));

        expect(mockedUsedRouter().push).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
    });
});
