import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- fireEvent
- no assertion

- doppelung keine Variable
- doppelung screen...
- TypeError
- setup Funktion

- 4 von 6 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redudndanz


Best-Practices: -30
CleanCode: -20
Testumfang: 50,1
 */

const existingUsers: User[] = [
    {
        name: 'Test User',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
    },
];

const setup = () => {
    const setUsers = jest.fn();
    render(<AddUserFormMittel users={existingUsers} setUsers={setUsers} />);
    return setUsers;
};

describe('AddUserForm', () => {
    it('should render without crashing', () => {
        setup();
    });

    it('should display an error message if the email is already taken', async () => {
        setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'Testpassword1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        const errorMessage = await screen.findByText('Es ist ein Fehler aufgetreten!');
        expect(errorMessage).toBeVisible();
    });

    it('should add a new user with valid input', async () => {
        const setUsers = setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@test.com');
        await userEvent.type(passwordInput, 'Testpassword1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(setUsers).toHaveBeenCalledWith([
            ...existingUsers,
            {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'Testpassword1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should display error messages for invalid password', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByText('Add User');

        // Test invalid password
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        const setUsers = setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@test.com');
        await userEvent.type(passwordInput, 'Testpassword1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        await userEvent.click(submitButton);

        expect(setUsers).toHaveBeenCalled();

        expect(nameInput.value).toBe('');
        expect(emailInput.value).toBe('');
        expect(passwordInput.value).toBe('');
        expect(roleSelect.value).toBe('');
    });

    it('should display department input for admin and employee roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeVisible();

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not display department input for customer role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
