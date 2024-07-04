import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*

- TypeError
- userEvent.setuo doppelung
- Doppelung variablen - 3

- 3 von 6 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: 0
CleanCode: -25
Testumfang: 33,4
 */

// Mock fetch to prevent actual API calls
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const setUsersMock = jest.fn();
    const users = [{ name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER }];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('handles input changes correctly', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@example.com');
        await user.type(passwordInput, 'ValidPassword1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('New User');
        expect(emailInput).toHaveValue('new@example.com');
        expect(passwordInput).toHaveValue('ValidPassword1!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('shows password error messages', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'invalid'); // Invalid password

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('shows error if email is already taken', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing@example.com'); // Email already in use
        await user.type(screen.getByLabelText('Password'), 'ValidPassword1!');
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('adds a new user successfully', async () => {
        const user = userEvent.setup();
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({}), // Mock API response
        });

        render(<AddUserFormMittel setUsers={setUsersMock} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const departmentInput = screen.getByLabelText('Department'); // This input is conditionally rendered

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@example.com');
        await user.type(passwordInput, 'ValidPassword1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        await user.type(departmentInput, 'IT'); // Assuming it's visible
        await user.click(screen.getByText('Add User'));

        // Asserts that fetch was called with correct parameters and the state was updated
        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'new@example.com',
                password: 'ValidPassword1!',
                role: USER_ROLE.ADMIN,
                department: 'IT',
            }),
        });
        expect(setUsersMock).toHaveBeenCalledWith([
            ...users,
            {
                name: 'New User',
                email: 'new@example.com',
                password: 'ValidPassword1!',
                role: USER_ROLE.ADMIN,
                department: 'IT',
            },
        ]);

        // Checks that inputs are reset to their initial values
        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
        expect(departmentInput).toHaveValue(''); // Assuming it's still visible
    });
});
