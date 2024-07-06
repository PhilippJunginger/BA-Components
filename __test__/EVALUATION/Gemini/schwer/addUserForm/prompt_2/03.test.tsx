import { render, screen, userEvent } from '../../test-utils';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup
- fireEvent
- parsing error
- wrong imports RTL

- doppelung variable - 2
- typerror

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -15
Testumfang: 50,1
 */

const mockUsers = [
    {
        userId: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'password123',
    },
];

const mockSetUsers = jest.fn();

describe('AddUserFormSchwer Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all fields', () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update state on input change', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'P@ssw0rd!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('P@ssw0rd!');
        expect(roleSelect).toHaveValue(USER_ROLE.CUSTOMER);
    });

    it('should show password error messages', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={[]} />);
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'pass');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should show error message if email is already taken', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, mockUsers[0].email);

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add new user', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ userId: '2' }),
        });

        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'New Test User');
        await user.type(emailInput, 'newuser@example.com');
        await user.type(passwordInput, 'P@ssw0rd1!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New Test User',
                email: 'newuser@example.com',
                password: 'P@ssw0rd1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'New Test User',
                email: 'newuser@example.com',
                password: 'P@ssw0rd1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should show department field if role is not customer', async () => {
        render(<AddUserFormSchwer setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
