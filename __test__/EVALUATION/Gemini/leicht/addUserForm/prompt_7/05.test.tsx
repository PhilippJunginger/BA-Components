import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- userEvent.setup
- promise not handled
- fireEvent

- doppelung variablen nicht benutzt - 2 mal
- doppelung screen...
- setup FUnktion

- 4 von 4 notwendigem Testumfang erreicht + 1 Asunahme + 1 Redundanzen


Best-Practices: -30
CleanCode: -25
Testumfang: 87,5
 */

const setup = () => {
    const users: User[] = [];
    const setUsers = jest.fn();

    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormLeicht', () => {
    it('should render all fields', () => {
        render(<AddUserFormLeicht users={[]} setUsers={() => {}} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should add a new user with valid input', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        const addButton = screen.getByText('Add User') as HTMLButtonElement;

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.type(passwordInput, 'Test123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.click(addButton);

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'Test User',
                email: 'test@test.com',
                password: 'Test123!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it('should show error message when email is already taken', async () => {
        const users: User[] = [
            { name: 'Existing User', email: 'existing@test.com', password: 'Test123!', role: USER_ROLE.CUSTOMER },
        ];
        render(<AddUserFormLeicht users={users} setUsers={() => {}} />);
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const addButton = screen.getByText('Add User') as HTMLButtonElement;

        await userEvent.type(emailInput, 'existing@test.com');
        fireEvent.click(addButton);

        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error message when password is not valid', async () => {
        setup();
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const addButton = screen.getByText('Add User') as HTMLButtonElement;

        await userEvent.type(passwordInput, 'Test123');
        fireEvent.click(addButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should render department field when role is not customer', () => {
        setup();
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should not render department field when role is customer', () => {
        setup();
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
