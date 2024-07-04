import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- userEvent.setuo missing

- doppelung screen
- unnötiges waitFor
- fill out Funktion

- 4 von 6 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 58,45
 */

const mockUsers: User[] = [
    {
        id: '1',
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
    },
];

const mockNewUser: User = {
    name: 'New User',
    email: 'newuser@example.com',
    password: 'Password1!',
    role: USER_ROLE.ADMIN,
    department: 'New department',
};

const fillOutForm = async (newUser: User) => {
    const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
    const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
    const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
    const roleSelect = screen.getByRole('combobox', { name: 'Role' }) as HTMLSelectElement;
    const departmentInput = screen.getByLabelText('Department') as HTMLInputElement;
    const submitButton = screen.getByRole('button', { name: 'Add User' });

    await userEvent.type(nameInput, newUser.name);
    await userEvent.type(emailInput, newUser.email);
    await userEvent.type(passwordInput, newUser.password);
    await userEvent.selectOptions(roleSelect, newUser.role);
    if (newUser.department) {
        await userEvent.type(departmentInput, newUser.department);
    }
    await userEvent.click(submitButton);
};

describe('AddUserFormMittel Component', () => {
    it('should render all input fields correctly', () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByRole('combobox', { name: 'Role' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should display department input for ADMIN and EMPLOYEE roles', async () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Role' }) as HTMLSelectElement;

        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeVisible();

        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeVisible();
    });

    it('should not display department input for CUSTOMER role', async () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Role' }) as HTMLSelectElement;

        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should handle form submission correctly', async () => {
        const setUsersMock = jest.fn();
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        await fillOutForm(mockNewUser);

        await waitFor(() => {
            expect(setUsersMock).toHaveBeenCalledWith([...mockUsers, mockNewUser]);
        });
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={() => {}} />);
        const existingUser: User = {
            name: 'Existing User',
            email: 'test1@example.com',
            password: 'Password1!',
            role: USER_ROLE.CUSTOMER,
        };

        await fillOutForm(existingUser);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should display error messages for invalid password', async () => {
        render(<AddUserFormMittel users={[]} setUsers={() => {}} />);
        const invalidPassword = 'short';

        const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
        await userEvent.type(passwordInput, invalidPassword);

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });
});
