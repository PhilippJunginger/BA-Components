import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- clean-code: unnötige render Funktion
- clean-code: Doppelung, userEvent.setup nicht in describe instanziiert
- clean code: setUsers jedesmal neu erstellt statt einmal zu erstellen i.V.m beforeEach
- keine Verwendung von Variablen, um setCall zu testen mit den Eingabedaten

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme

Best-Practices: 0
CleanCode: 0
Testumfang: 100
 */

const setup = () => {
    const setUsers = jest.fn();
    const users: User[] = [];
    render(<AddUserFormLeicht setUsers={setUsers} users={users} />);
    const user = userEvent.setup();
    return { setUsers, users, user };
};

describe('AddUserFormLeicht', () => {
    it('should display error for invalid password', async () => {
        const { user } = setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'weakpass');

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('should display error if email already exists', async () => {
        const setUsers = jest.fn();
        const users: User[] = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        render(<AddUserFormLeicht setUsers={setUsers} users={users} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should call setUsers with new user on valid input', async () => {
        const { setUsers, user } = setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'Password1!',
                },
            ]),
        );
    });

    it('should show department field for admin role', async () => {
        const { user } = setup();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should hide department field for customer role', async () => {
        const { user } = setup();

        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
});
