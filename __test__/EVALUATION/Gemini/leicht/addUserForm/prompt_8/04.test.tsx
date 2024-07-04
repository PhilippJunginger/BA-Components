import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup
- fireEvent


- doppelung screen..

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundanzen


Best-Practices: -20
CleanCode: -5
Testumfang: 87,5
 */

const user: User = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'Password123!',
    role: USER_ROLE.CUSTOMER,
};

const users: User[] = [
    {
        name: 'Existing User',
        email: 'existing@test.com',
        password: 'Password123!',
        role: USER_ROLE.CUSTOMER,
    },
];

const setUsersMock = jest.fn();

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        setUsersMock.mockClear();
    });

    it('should render all input fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={setUsersMock} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should update input fields correctly', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, user.name);
        await userEvent.type(emailInput, user.email);
        await userEvent.type(passwordInput, user.password);
        await userEvent.selectOptions(roleSelect, user.role);

        expect(nameInput).toHaveValue(user.name);
        expect(emailInput).toHaveValue(user.email);
        expect(passwordInput).toHaveValue(user.password);
        expect(roleSelect).toHaveValue(user.role);
    });

    it('should show error message for existing email', async () => {
        render(<AddUserFormLeicht users={users} setUsers={setUsersMock} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, users[0].email);
        fireEvent.blur(emailInput);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error message for invalid password', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={setUsersMock} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'invalid');
        fireEvent.blur(passwordInput);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add a new user with valid data', async () => {
        render(<AddUserFormLeicht users={users} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, user.name);
        await userEvent.type(emailInput, user.email);
        await userEvent.type(passwordInput, user.password);
        await userEvent.selectOptions(roleSelect, user.role);
        await userEvent.click(addUserButton);

        expect(setUsersMock).toHaveBeenCalledWith([...users, user]);
    });

    it('should render department input for admin and employee roles', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={setUsersMock} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not render department input for customer role', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={setUsersMock} />);

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
