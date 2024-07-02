import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen

Best-Practices: 0
CleanCode: 0
Testumfang: 75
 */

const user = userEvent.setup();

describe('AddUserFormLeicht Component', () => {
    const setUsersMock = jest.fn();
    const usersMock = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should display entered name', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const nameInput = screen.getByLabelText('Name');

        await user.type(nameInput, 'Jane');
        expect(nameInput).toHaveValue('Jane');
    });

    it('should display entered email', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const emailInput = screen.getByLabelText('Email');

        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should show error for existing email', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const emailInput = screen.getByLabelText('Email');

        await user.type(emailInput, 'john@example.com');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should show password error for invalid password', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'short');
        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should change role value', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        const optionAdmin = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await user.click(optionAdmin);

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display department input when role is not customer', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        const optionAdmin = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await user.click(optionAdmin);

        const departmentInput = screen.getByLabelText('Department');
        expect(departmentInput).toBeInTheDocument();
    });

    it('should add user successfully with valid inputs', async () => {
        render(<AddUserFormLeicht users={usersMock} setUsers={setUsersMock} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        const optionAdmin = screen.getByRole('option', { name: USER_ROLE.ADMIN });
        await user.click(optionAdmin);

        const submitButton = screen.getByRole('button', { name: /add user/i });
        await user.click(submitButton);

        expect(setUsersMock).toHaveBeenCalledWith([
            ...usersMock,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ]);
    });
});
