import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- minor: unused import
- clean code: did not instantiate userEvent.setup() at top-level
- clean code: keine Variablen erstellt, Doppelung

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 2 Redundanzen

Best-Practices: 0
CleanCode: -15
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const initialUsers: User[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];
    const setUsersMock = jest.fn();

    beforeEach(() => {
        setUsersMock.mockClear();
    });

    it.skip('should render the form with initial state', () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    it.skip('should update state on input change', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        expect(screen.getByLabelText(/Name/i)).toHaveValue('Jane Doe');

        await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('jane@example.com');

        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('Password123!');

        await user.click(screen.getByLabelText(/Role/i));
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Role/i)).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error if email already exists', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
        expect(setUsersMock).not.toHaveBeenCalled();
    });

    it('should show password error if password is invalid', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Password/i), 'pass');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(setUsersMock).not.toHaveBeenCalled();
    });

    it.skip('should add user if all fields are valid', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.click(screen.getByLabelText(/Role/i));
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsersMock).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ]);
    });

    it.skip('should show department field if role is ADMIN or EMPLOYEE', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/Role/i));
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('should not show department field if role is CUSTOMER', async () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={setUsersMock} />);
        const user = userEvent.setup();

        await user.click(screen.getByLabelText(/Role/i));
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
