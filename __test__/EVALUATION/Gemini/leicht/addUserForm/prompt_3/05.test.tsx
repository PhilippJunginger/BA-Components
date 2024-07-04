import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: userEvent.setup not used
- critical: fireEvent

- render Funktion
- doppelung variablen nicht benutzt - 2 mal
- doppelung screen - 1

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 75
 */

const mockUsers: User[] = [
    {
        name: 'test',
        email: 'test@test.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testuser1!',
    },
];
const mockSetUsers = jest.fn();
describe('AddUserFormLeicht', () => {
    it('should render correctly', () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });
    it('should update the user state on input change', () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        fireEvent.change(nameInput, { target: { value: 'test' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Testuser1!' } });
        expect(nameInput.value).toBe('test');
        expect(emailInput.value).toBe('test@test.com');
        expect(passwordInput.value).toBe('Testuser1!');
    });
    it('should call the handleAddUser function on form submit', async () => {
        render(<AddUserFormLeicht users={[]} setUsers={mockSetUsers} />);
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: /add user/i });
        fireEvent.change(nameInput, { target: { value: 'test' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Testuser1!' } });
        await userEvent.click(submitButton);
        expect(mockSetUsers).toHaveBeenCalledTimes(1);
    });
    it('should show error message if email is already taken', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: /add user/i });
        fireEvent.change(nameInput, { target: { value: 'test' } });
        fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
        fireEvent.change(passwordInput, { target: { value: 'Testuser1!' } });
        await userEvent.click(submitButton);
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });
    it('should display department field for admin and employee', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
    it('should not display department field for customer', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
        const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });
    it('should validate password correctly', async () => {
        render(<AddUserFormLeicht users={mockUsers} setUsers={mockSetUsers} />);
        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        const submitButton = screen.getByRole('button', { name: /add user/i });

        // Test invalid passwords
        fireEvent.change(passwordInput, { target: { value: 'Test1' } }); // Too short
        await userEvent.click(submitButton);
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();

        fireEvent.change(passwordInput, { target: { value: 'testtest' } }); // Missing uppercase and special character
        await userEvent.click(submitButton);
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();

        fireEvent.change(passwordInput, { target: { value: 'TESTTEST' } }); // Missing lowercase and special character
        await userEvent.click(submitButton);
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();

        fireEvent.change(passwordInput, { target: { value: 'Testtest1' } }); // Missing special character
        await userEvent.click(submitButton);
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();

        // Test valid password
        fireEvent.change(passwordInput, { target: { value: 'Testuser1!' } });
        await userEvent.click(submitButton);
        expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeInTheDocument();
    });
});
