import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- waitFor

- variable - 2
- screen
. tyoerror

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 50,1
 */

const mockUsers: User[] = [
    {
        userId: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

// Mock the fetch function to simulate API calls
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form correctly', () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should handle form input changes correctly', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test.user@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Name')).toHaveValue('Test User');
        expect(screen.getByLabelText('Email')).toHaveValue('test.user@example.com');
        expect(screen.getByLabelText('Password')).toHaveValue('Test1234!');
        expect(screen.getByLabelText('Role')).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormSchwer setUsers={() => {}} users={[]} />);
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test1');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should submit the form and create a new user', async () => {
        const mockNewUser: User = {
            name: 'Test User',
            email: 'test.user@example.com',
            password: 'Test1234!',
            role: USER_ROLE.ADMIN,
        };

        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
            status: 201,
        });

        const setUsersMock = jest.fn();
        render(<AddUserFormSchwer setUsers={setUsersMock} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, mockNewUser.name);
        await userEvent.type(emailInput, mockNewUser.email);
        await userEvent.type(passwordInput, mockNewUser.password);
        await userEvent.selectOptions(roleSelect, mockNewUser.role);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
                method: 'POST',
                body: JSON.stringify(mockNewUser),
            });
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, { ...mockNewUser, userId: expect.any(String) }]);
        });
    });

    it('should show an error message if email is already taken', async () => {
        (fetch as jest.Mock).mockResolvedValue({
            json: () => Promise.resolve({ userId: '2' }),
            status: 201,
        });

        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const nameInput = screen.getByLabelText('Name');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, mockUsers[0].email);
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });

    it('should show an error if creating user fails', async () => {
        (fetch as jest.Mock).mockRejectedValue({ message: 'Failed to create user' });
        render(<AddUserFormSchwer setUsers={() => {}} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const nameInput = screen.getByLabelText('Name');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test.user@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });
});
