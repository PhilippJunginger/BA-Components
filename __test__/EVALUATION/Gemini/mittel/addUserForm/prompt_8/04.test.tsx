import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- fireEvent
- userEvent-setup fehlt

- doppelung keine Variable - 2
- doppelung screen...

- 4 von 6 notwendigem Testumfang erreicht + Ausnahmen


Best-Practices: -20
CleanCode: -15
Testumfang: 66,8
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormMittel users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormMittel Component', () => {
    describe('Form Validation', () => {
        it.only('should initially set password error to undefined', () => {
            setup();
            expect(screen.queryByText(/Password needs to be 8 characters long/i)).toBeNull();
        });

        it('should display password validation errors', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
            await userEvent.type(passwordInput, 'Test1');

            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeVisible();
            expect(screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i)).toBeVisible();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeVisible();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeVisible();
        });

        it('should clear password errors when valid password is entered', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
            await userEvent.type(passwordInput, 'Test1234!');

            expect(screen.queryByText(/Password needs to be 8 characters long/i)).toBeNull();
            expect(screen.queryByText(/Needs to contain at least one uppercase and one lowercase letter/i)).toBeNull();
            expect(screen.queryByText(/Needs to contain at least one digit/i)).toBeNull();
            expect(screen.queryByText(/Needs to contain at least one special character/i)).toBeNull();
        });

        it('should display error message when email is already taken', async () => {
            const existingUsers: User[] = [
                { name: 'Test User', email: 'test@test.com', role: USER_ROLE.CUSTOMER, password: 'Test1234!' },
            ];
            const { setUsers } = setup(existingUsers);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
            const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
            const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
            const submitButton = screen.getByRole('button', { name: /Add User/i });

            await userEvent.type(nameInput, 'New User');
            await userEvent.type(emailInput, 'test@test.com');
            await userEvent.type(passwordInput, 'Test1234!');
            fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
            await userEvent.click(submitButton);

            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
            expect(setUsers).not.toHaveBeenCalled();
        });
    });

    describe('Form Submission', () => {
        it('should submit form with valid data', async () => {
            const { setUsers } = setup();
            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
            const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
            const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
            const submitButton = screen.getByRole('button', { name: /Add User/i });

            await userEvent.type(nameInput, 'New User');
            await userEvent.type(emailInput, 'newuser@test.com');
            await userEvent.type(passwordInput, 'Test1234!');
            fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
            await userEvent.click(submitButton);

            const newUser: User = {
                name: 'New User',
                email: 'newuser@test.com',
                password: 'Test1234!',
                role: USER_ROLE.CUSTOMER,
            };

            expect(setUsers).toHaveBeenCalledWith([newUser]);
        });

        it('should clear form after successful submission', async () => {
            const { setUsers } = setup();
            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
            const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
            const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;
            const submitButton = screen.getByRole('button', { name: /Add User/i });

            await userEvent.type(nameInput, 'New User');
            await userEvent.type(emailInput, 'newuser@test.com');
            await userEvent.type(passwordInput, 'Test1234!');
            fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
            await userEvent.click(submitButton);

            expect(nameInput.value).toBe('');
            expect(emailInput.value).toBe('');
            expect(passwordInput.value).toBe('');
            expect(roleSelect.value).toBe('');
        });
    });

    describe('Conditional Rendering', () => {
        it('should render department field for admin and employee roles', async () => {
            setup();
            const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

            fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
            expect(screen.getByLabelText('Department')).toBeVisible();

            fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } });
            expect(screen.getByLabelText('Department')).toBeVisible();
        });

        it('should not render department field for customer role', async () => {
            setup();
            const roleSelect = screen.getByLabelText('Role') as HTMLSelectElement;

            fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
            expect(screen.queryByLabelText('Department')).toBeNull();
        });
    });
});
