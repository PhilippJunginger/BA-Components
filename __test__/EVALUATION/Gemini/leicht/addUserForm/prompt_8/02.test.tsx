import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup
- fireEvent

- userEvent.setup doppelung
- doppelung variablen nicht benutzt - 3 mal
- setup FUnktion

- 3 von 4 notwendigem Testumfang erreicht + 2 Redundanzen


Best-Practices: -20
CleanCode: -25
Testumfang: 50
 */

const setup = () => {
    const users: User[] = [];
    const setUsers = jest.fn();

    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

    return { users, setUsers };
};

describe('AddUserFormLeicht Component', () => {
    it('should update input fields correctly', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const departmentInput = screen.queryByLabelText('Department') as HTMLInputElement;

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Test1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(nameInput.value).toBe('Test User');
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('Test1234!');
        expect(roleSelect.value).toBe(USER_ROLE.ADMIN);
        expect(departmentInput).toBeVisible();
    });

    it('should show an error message if the email is already taken', async () => {
        const { users, setUsers } = setup();
        users.push({
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password123',
        });

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(emailInput, 'existing@example.com');
        fireEvent.click(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should show an error message if the password is not strong enough', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(passwordInput, 'weakpassword');
        fireEvent.click(addUserButton);

        const errorListItems = screen.getAllByRole('listitem');
        expect(errorListItems).toHaveLength(4);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should add a new user with valid data', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'new@example.com');
        await userEvent.type(passwordInput, 'New1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(addUserButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'New User',
                email: 'new@example.com',
                password: 'New1234!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should clear the form after adding a user', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        await userEvent.type(nameInput, 'Another User');
        await userEvent.type(emailInput, 'another@example.com');
        await userEvent.type(passwordInput, 'Another1234!');
        fireEvent.click(addUserButton);

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
    });
});
