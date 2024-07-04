import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: promises not handled
- userEvent.setup
- fireEvent

- doppelung variablen nicht benutzt - 1 mal
- setup FUnktion
- TypeError

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen


Best-Practices: -30
CleanCode: -10
Testumfang: 75
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormMittel users={users} setUsers={setUsers} />);
    return { setUsers };
};

const testUser: User = {
    name: 'Test User',
    email: 'test@test.com',
    password: 'Password1!',
    role: USER_ROLE.CUSTOMER,
};

describe('AddUserForm', () => {
    it('should render all fields', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should add a new user with valid input', async () => {
        const { setUsers } = setup();
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: testUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: testUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: testUser.password } });
        await userEvent.selectOptions(screen.getByLabelText('Role'), [testUser.role]);
        fireEvent.submit(screen.getByText('Add User'));
        expect(setUsers).toHaveBeenCalledWith([testUser]);
    });

    it('should show error message if email already exists', async () => {
        const users: User[] = [
            {
                name: 'Existing User',
                email: 'test@test.com',
                password: 'Password1!',
                role: USER_ROLE.CUSTOMER,
            },
        ];
        setup(users);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: testUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: testUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: testUser.password } });
        await userEvent.selectOptions(screen.getByLabelText('Role'), [testUser.role]);
        fireEvent.submit(screen.getByText('Add User'));
        expect(screen.getByText('Email already exists!')).toBeVisible();
    });

    it('should show error message if password is not valid', async () => {
        setup();
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: testUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: testUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password' } });
        await userEvent.selectOptions(screen.getByLabelText('Role'), [testUser.role]);
        fireEvent.submit(screen.getByText('Add User'));
        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
    });

    it('should render department field if user is not a customer', async () => {
        setup();
        await userEvent.selectOptions(screen.getByLabelText('Role'), [USER_ROLE.ADMIN]);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should clear the form after adding a user', async () => {
        const { setUsers } = setup();
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: testUser.name } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: testUser.email } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: testUser.password } });
        await userEvent.selectOptions(screen.getByLabelText('Role'), [testUser.role]);
        fireEvent.submit(screen.getByText('Add User'));

        expect(setUsers).toHaveBeenCalledWith([testUser]);
        expect(screen.getByLabelText('Name')).toHaveValue('');
        expect(screen.getByLabelText('Email')).toHaveValue('');
        expect(screen.getByLabelText('Password')).toHaveValue('');
        expect(screen.getByLabelText('Role')).toHaveValue('');
    });
});
