import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*

- clean-code: unnötige render Funktion
- clean-code: Doppelung, userEvent.setup nicht in describe instanziiert
- clean code: setUsers jedesmal neu erstellt statt einmal zu erstellen i.V.m beforeEach
- TypeError: users not given type

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen

Best-Practices: 0
CleanCode: 0
Testumfang: 75
 */

const setup = () => {
    const users = [];
    const setUsers = jest.fn();
    render(<AddUserFormLeicht users={users} setUsers={setUsers} />);
    return { users, setUsers };
};

describe('AddUserFormLeicht', () => {
    test('should render the form with all fields', () => {
        setup();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('should show entered values', async () => {
        const user = userEvent.setup();
        setup();

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane.doe@example.com');
        expect(passwordInput).toHaveValue('Password1!');
        expect(roleSelect).toHaveValue(USER_ROLE.EMPLOYEE);
    });

    test.skip('should display error if email already exists', async () => {
        const user = userEvent.setup();
        const users = [
            { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        const setUsers = jest.fn();
        render(<AddUserFormLeicht users={users} setUsers={setUsers} />);

        const emailInput = screen.getByLabelText(/email/i);
        await user.type(emailInput, 'existing@example.com');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText(/email already exists/i)).toBeInTheDocument();
    });

    test('should display password error if password does not meet criteria', async () => {
        const user = userEvent.setup();
        setup();

        const passwordInput = screen.getByLabelText(/password/i);
        await user.type(passwordInput, 'weakpass');

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one uppercase/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    test.skip('should call setUsers with new user data on form submission', async () => {
        const user = userEvent.setup();
        const { setUsers } = setup();

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(setUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ]);
    });
});
