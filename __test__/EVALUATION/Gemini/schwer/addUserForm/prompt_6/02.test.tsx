import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';

/*
- userEvent setup

- variable - 3
- unused import
- type error

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -10
CleanCode: -25
Testumfang: 50,1
 */

describe('AddUserForm', () => {
    const setUsersMock = jest.fn();
    const users = [{ name: 'Test User', email: 'test@test.com', role: USER_ROLE.CUSTOMER, password: 'Test1234!' }];

    beforeEach(() => {
        setUsersMock.mockClear();
    });

    it('should render all input fields', () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should update input fields correctly', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(nameInput, 'Max Mustermann');
        await userEvent.type(emailInput, 'max.mustermann@example.com');
        await userEvent.type(passwordInput, 'SecurePassword123!');

        expect(nameInput).toHaveValue('Max Mustermann');
        expect(emailInput).toHaveValue('max.mustermann@example.com');
        expect(passwordInput).toHaveValue('SecurePassword123!');
    });

    it('should display password error messages', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);
        const passwordInput = screen.getByLabelText('Password');

        await userEvent.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should show error message for duplicate email', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);
        const emailInput = screen.getByLabelText('Email');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(emailInput, 'test@test.com');
        await userEvent.click(addUserButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should add a new user with valid data', async () => {
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            status: 200,
            json: async () => ({ userId: 'newUserId' }),
        });

        render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'New User');
        await userEvent.type(emailInput, 'newuser@example.com');
        await userEvent.type(passwordInput, 'NewPassword123!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
        await userEvent.click(addUserButton);

        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword123!',
                role: USER_ROLE.EMPLOYEE,
            }),
        });

        expect(setUsersMock).toHaveBeenCalledWith([
            ...users,
            {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'NewPassword123!',
                role: USER_ROLE.EMPLOYEE,
            },
        ]);

        fetchMock.mockRestore();
    });

    it('should display department field for employee role', async () => {
        render(<AddUserFormSchwer setUsers={setUsersMock} users={users} />);
        const roleSelect = screen.getByLabelText('Role');

        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });

        expect(screen.getByLabelText('Department')).toBeVisible();
    });
});
