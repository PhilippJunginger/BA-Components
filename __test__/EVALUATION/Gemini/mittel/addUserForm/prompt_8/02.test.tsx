import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent

- doppelung keine Variable - 2
- doppelung screen
- setup Funktion

- 4 von 6 notwendigem Testumfang erreicht + 1 Ausnahme + 3 Redudndanz


Best-Practices: -10
CleanCode: -20
Testumfang: 41,75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormMittel users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();

    it('should render all fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update user state on input change', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;

        await user.type(nameInput, 'Test User');
        await user.type(emailInput, 'test@example.com');
        await user.type(passwordInput, 'Test1234!');

        expect(nameInput.value).toBe('Test User');
        expect(emailInput.value).toBe('test@example.com');
        expect(passwordInput.value).toBe('Test1234!');
    });

    it('should select correct role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        await user.click(employeeOption);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should display department field for admin and employee', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);

        // Check for Admin
        const adminOption = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await user.click(adminOption);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        // Check for Employee
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        await user.click(employeeOption);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not display department field for customer', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);

        // Check for Customer
        const customerOption = screen.getByRole('option', { name: USER_ROLE.CUSTOMER });
        await user.click(customerOption);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should display error message for duplicate email', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password',
        };
        const { setUsers } = setup([existingUser]);

        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        await user.type(emailInput, 'existing@example.com');
        const addButton = screen.getByText('Add User');
        await user.click(addButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });

    it('should add a new user', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByText('Add User');

        await user.type(nameInput, 'New User');
        await user.type(emailInput, 'new@example.com');
        await user.type(passwordInput, 'New1234!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await user.click(addButton);

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

    it('should validate password and show error messages', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const addButton = screen.getByText('Add User');

        // Test with invalid password
        await user.type(passwordInput, 'Test1');
        await user.click(addButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();

        // Test with valid password
        await user.clear(passwordInput);
        await user.type(passwordInput, 'Test1234!');
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
        expect(
            screen.queryByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Needs to contain at least one digit')).not.toBeInTheDocument();
        expect(screen.queryByText('Needs to contain at least one special character')).not.toBeInTheDocument();
    });
});
