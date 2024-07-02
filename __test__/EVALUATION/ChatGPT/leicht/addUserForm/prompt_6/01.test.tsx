import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von render in beforeEach
- critical: Verwendung von fireEvent
- critical: Kein instantiierung von userEvent.setup()

- 4 von 4 notwendigem Testumfang erreicht + eine Ausnahme + 6 Redundanzen

Best-Practices: -30
CleanCode: 0
Testumfang: 25
 */

const mockSetUsers = jest.fn();
const initialUsers: User[] = [];

describe('AddUserFormLeicht', () => {
    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);
    });

    it('should show entered name', async () => {
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it('should show entered email', async () => {
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('should show password error message for invalid password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'weakpass');
        fireEvent.blur(passwordInput);
        expect(screen.getByText(/Password needs to be 8 characters long/)).toBeInTheDocument();
    });

    it('should not show password error message for valid password', async () => {
        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Str0ngPass!');
        fireEvent.blur(passwordInput);
        expect(screen.queryByText(/Password needs to be 8 characters long/)).not.toBeInTheDocument();
    });

    it('should show role select options', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);
        const options = screen.getAllByRole('option');
        expect(options).toHaveLength(Object.values(USER_ROLE).length);
    });

    it('should change role value', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display department field if role is not customer', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        const departmentInput = screen.getByLabelText('Department');
        expect(departmentInput).toBeInTheDocument();
    });

    it('should not display department field if role is customer', async () => {
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));
        const departmentInput = screen.queryByLabelText('Department');
        expect(departmentInput).not.toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        render(
            <AddUserFormLeicht setUsers={mockSetUsers} users={[{ ...initialUsers[0], email: 'taken@example.com' }]} />,
        );
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'taken@example.com');
        fireEvent.blur(emailInput);
        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('should call setUsers with new user data on form submit', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Str0ngPass!');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    password: 'Str0ngPass!',
                    role: USER_ROLE.ADMIN,
                }),
            ]),
        );
    });

    it('should reset form fields after successful submission', async () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john.doe@example.com');
        await userEvent.type(passwordInput, 'Str0ngPass!');
        await userEvent.selectOptions(roleSelect, screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await userEvent.click(screen.getByRole('button', { name: /Add User/i }));

        expect(nameInput).toHaveValue('');
        expect(emailInput).toHaveValue('');
        expect(passwordInput).toHaveValue('');
        expect(roleSelect).toHaveValue('');
    });
});
