import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- fireEvent

- userEvent.setup doppelung
- doppelung - keine Variable - 2 mal
- doppelung screen..

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanzen


Best-Practices: -20
CleanCode: -10
Testumfang: 75
 */

const setup = () => {
    const users: User[] = [];
    const setUsers = jest.fn();

    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

    return { users, setUsers };
};

describe('AddUserFormLeicht Component', () => {
    it('should render all input fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={() => {}} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update input fields correctly', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht users={[]} setUsers={() => {}} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Test1234!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error message for existing email', async () => {
        const user = userEvent.setup();
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password123',
        };
        const { setUsers } = setup();

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, existingUser.email);

        fireEvent.click(screen.getByText('Add User'));

        expect(setUsers).not.toHaveBeenCalled();
        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error message for invalid password', async () => {
        const user = userEvent.setup();
        setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'invalid');

        fireEvent.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add a new user with valid input', async () => {
        const user = userEvent.setup();
        const { setUsers } = setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@example.com');
        await user.type(passwordInput, 'New1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        fireEvent.click(screen.getByText('Add User'));

        expect(setUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'New User',
                    email: 'new@example.com',
                    password: 'New1234!',
                    role: USER_ROLE.CUSTOMER,
                }),
            ]),
        );
    });

    it('should show department field for admin and employee roles', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht users={[]} setUsers={() => {}} />);

        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeVisible();

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not show department field for customer role', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={() => {}} />);

        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
