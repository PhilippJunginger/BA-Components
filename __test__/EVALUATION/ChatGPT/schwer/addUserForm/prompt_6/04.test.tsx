import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*

- render Funkton erstellt
- clean code: keine variablen erstellt - 5 mal

- 4 von 7 notwendigen Testumfang erreicht + 6 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 14,3
*/

describe('AddUserFormSchwer Component', () => {
    const setup = () => {
        const setUsers = jest.fn();
        const users: User[] = [];
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
        const user = userEvent.setup();
        return { setUsers, users, user };
    };

    it('should render form fields correctly', () => {
        setup();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show entered name value', async () => {
        const { user } = setup();

        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should show entered email value', async () => {
        const { user } = setup();

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane.doe@example.com');
        expect(emailInput).toHaveValue('jane.doe@example.com');
    });

    it('should validate password requirements', async () => {
        const { user } = setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'Passw0rd!');
        expect(passwordInput).toHaveValue('Passw0rd!');
    });

    it('should display password error messages', async () => {
        const { user } = setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');
        expect(await screen.findByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(await screen.findByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(
            await screen.findByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(await screen.findByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should change role select field', async () => {
        const { user } = setup();

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByRole('button', { name: USER_ROLE.ADMIN })).toBeInTheDocument();
    });

    it('should display department field when role is not CUSTOMER', async () => {
        const { user } = setup();

        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should submit the form and call setUsers', async () => {
        const { user, setUsers } = setup();

        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.type(screen.getByLabelText('Department'), 'IT');

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsers).toHaveBeenCalled();
    });

    it('should show error if email already taken', async () => {
        const setUsers = jest.fn();
        const users = [
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Passw0rd!' },
        ];
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.type(screen.getByLabelText('Department'), 'IT');

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('should close error alert when close icon is clicked', async () => {
        const setUsers = jest.fn();
        const users = [
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Passw0rd!' },
        ];
        render(<AddUserFormSchwer setUsers={setUsers} users={users} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Passw0rd!');
        await user.click(screen.getByLabelText('Role'));
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        await user.type(screen.getByLabelText('Department'), 'IT');

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        const closeButton = await screen.findByLabelText('close-icon');
        await user.click(closeButton);

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
