import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- fireEvent
- userEvent.setup

- setup Funktion
- doppelung variablen
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 87,5
 */

const mockSetUsers = jest.fn();

const setup = () => {
    const users: User[] = [
        {
            name: 'Test User',
            email: 'test@test.com',
            role: USER_ROLE.CUSTOMER,
            password: 'TestPassword123!',
        },
    ];

    render(<AddUserFormLeicht users={users} setUsers={mockSetUsers} />);
    return { users };
};

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render all form fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should successfully add a new user with valid details', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@email.com');
        await userEvent.type(passwordInput, 'NewUser123!');
        fireEvent.mouseDown(roleSelect);
        screen.getByText(USER_ROLE.EMPLOYEE).click();
        fireEvent.click(submitButton);

        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'Test User',
                email: 'test@test.com',
                role: USER_ROLE.CUSTOMER,
                password: 'TestPassword123!',
            },
            {
                name: 'New User',
                email: 'newuser@email.com',
                role: USER_ROLE.EMPLOYEE,
                password: 'NewUser123!',
                department: '',
            },
        ]);
    });

    it('should show an error message if email is already taken', async () => {
        const { users } = setup();
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(emailInput, users[0].email);
        await userEvent.type(passwordInput, 'TestPassword123!');
        fireEvent.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show error messages for invalid password', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        // Test with password less than 8 characters
        await userEvent.type(passwordInput, 'Test1!');
        fireEvent.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        // Test with password missing uppercase letter
        await userEvent.clear(passwordInput);
        await userEvent.type(passwordInput, 'test123!');
        fireEvent.click(submitButton);
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
    });

    it('should render department field for admin and employee roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');

        // Check for employee role
        fireEvent.mouseDown(roleSelect);
        screen.getByText(USER_ROLE.EMPLOYEE).click();
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        // Check for admin role
        fireEvent.mouseDown(roleSelect);
        screen.getByText(USER_ROLE.ADMIN).click();
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not render department field for customer role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');

        // Check for customer role
        fireEvent.mouseDown(roleSelect);
        screen.getByText(USER_ROLE.CUSTOMER).click();
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
