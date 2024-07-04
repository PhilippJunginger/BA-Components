import { render, screen, fireEvent } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: promises not handled
- critical: userEvent.setup not used
- critical: verwendung fireEvent

- render Funktion
- doppelung variablen nicht benutzt - 4 mal
- doppelung screen

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanz

Best-Practices: -30
CleanCode: -30
Testumfang: 75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht', () => {
    it('renders all fields', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('renders department field for admin and employee', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('does not render department field for customer', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('updates new user state on input change', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        expect((nameInput as HTMLInputElement).value).toBe('Test User');
        expect((emailInput as HTMLInputElement).value).toBe('test@test.com');
        expect((passwordInput as HTMLInputElement).value).toBe('Test1234!');
        expect((roleSelect as HTMLSelectElement).value).toBe(USER_ROLE.CUSTOMER);
    });

    it('validates password correctly', () => {
        setup();
        const passwordInput = screen.getByLabelText('Password');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        // Invalid passwords
        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(addUserButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();

        fireEvent.change(passwordInput, { target: { value: 'test1234!' } });
        fireEvent.click(addUserButton);
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();

        fireEvent.change(passwordInput, { target: { value: 'Testtest!' } });
        fireEvent.click(addUserButton);
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();

        fireEvent.change(passwordInput, { target: { value: 'Test1234' } });
        fireEvent.click(addUserButton);
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Valid password
        fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
        fireEvent.click(addUserButton);
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeVisible();
    });

    it('validates email uniqueness', () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@test.com',
            password: 'Password123!',
            role: USER_ROLE.CUSTOMER,
        };
        const { setUsers } = setup([existingUser]);
        const emailInput = screen.getByLabelText('Email');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        fireEvent.change(emailInput, { target: { value: 'existing@test.com' } });
        fireEvent.click(addUserButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('adds a new user with valid data', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByRole('button', { name: /add user/i });

        fireEvent.change(nameInput, { target: { value: 'Test User' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Test1234!' } });
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        fireEvent.click(addUserButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'Test User',
                email: 'test@test.com',
                password: 'Test1234!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);

        expect((nameInput as HTMLInputElement).value).toBe('');
        expect((emailInput as HTMLInputElement).value).toBe('');
        expect((passwordInput as HTMLInputElement).value).toBe('');
        expect((roleSelect as HTMLSelectElement).value).toBe('');
    });
});
