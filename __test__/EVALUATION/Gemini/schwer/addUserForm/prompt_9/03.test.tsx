import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- wrong mock
- waitFor

- tyoerror - 4
- variable - 2

- 4 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: -30
CleanCode: - 30
Testumfang: 58,45
 */

const mockedUsedNavigate = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockedUsedNavigate,
        query: { shouldRoute: 'true' },
    }),
}));

const mockFetch = jest.fn();
global.fetch = mockFetch;

const testUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'TestPassword1!',
    },
];

describe('AddUserForm', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all fields', () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should add a new user with valid data', async () => {
        mockFetch.mockResolvedValueOnce({
            status: 200,
            json: () => Promise.resolve({ userId: '2' }),
        });

        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        await userEvent.type(screen.getByLabelText('Name'), 'New User');
        await userEvent.type(screen.getByLabelText('Email'), 'newuser@example.com');
        await userEvent.type(screen.getByLabelText('Password'), 'NewPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify({
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'NewPassword1!',
                    role: USER_ROLE.CUSTOMER,
                }),
            });
            expect(setUsersMock).toHaveBeenCalledWith([
                {
                    name: 'New User',
                    email: 'newuser@example.com',
                    password: 'NewPassword1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
            expect(mockedUsedNavigate).toHaveBeenCalledWith('http://localhost:3000/users?id=2');
        });
    });

    it('should show error message when email is already taken', async () => {
        render(<AddUserFormSchwer users={testUsers} setUsers={() => {}} />);

        await userEvent.type(screen.getByLabelText('Name'), 'Test User 2');
        await userEvent.type(screen.getByLabelText('Email'), testUsers[0].email);
        await userEvent.type(screen.getByLabelText('Password'), 'TestPassword1!');
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });

    it('should validate password and show error messages', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should show department field when user role is not customer', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={() => {}} />);

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
