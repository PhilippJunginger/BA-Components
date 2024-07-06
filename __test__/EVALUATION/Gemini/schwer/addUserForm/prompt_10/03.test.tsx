import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- comment ts ignore

- tyoerror

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -5
Testumfang: 33,4
 */

const mockUsers: User[] = [
    {
        userId: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'password123!',
    role: USER_ROLE.ADMIN,
};

const mockCreateUser = jest.fn();

jest.mock('next/router', () => ({
    useRouter() {
        return {
            push: jest.fn(),
            query: {},
        };
    },
}));

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '2' }),
        status: 200,
    }),
);

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCreateUser.mockResolvedValue({ userId: '2' });
    });

    it('should render the form correctly', () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should handle input changes correctly', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);

        expect(nameInput).toHaveValue(mockNewUser.name);
        expect(emailInput).toHaveValue(mockNewUser.email);
        expect(passwordInput).toHaveValue(mockNewUser.password);
        expect(roleSelect).toHaveValue(mockNewUser.role);
    });

    it('should display validation errors for password', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={jest.fn()} />);
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, mockUsers[0].email);
        const submitButton = screen.getByText('Add User');
        await userEvent.click(submitButton);
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should successfully submit the form and add a new user', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, department: undefined }]);
        });
    });
});
