import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*

- tyoerror
- variable -3

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: 0
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

// Mock the fetch function to avoid actual API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ userId: '2' }),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();
    const setUsersMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form correctly', () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should handle input changes correctly', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test1234!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        render(<AddUserFormSchwer users={[]} setUsers={setUsersMock} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Submit with empty password
        await user.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Enter a password that is too short
        await user.type(passwordInput, 'Test1');
        await user.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await user.type(nameInput, 'Test User 2');
        await user.type(emailInput, 'test1@example.com');
        await user.type(passwordInput, 'Test1234!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user successfully', async () => {
        render(<AddUserFormSchwer users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await user.type(nameInput, 'Test User 2');
        await user.type(emailInput, 'test2@example.com');
        await user.type(passwordInput, 'Test1234!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(submitButton);

        // Wait for the fetch call to complete and the state to update
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(setUsersMock).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'Test User 2',
                    email: 'test2@example.com',
                    password: 'Test1234!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });
});
