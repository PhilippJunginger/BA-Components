import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt

- unused import
- doppelung keine variable - 2

- 4 von 6 notwendigem Testumfang erreicht + 6 Ausnahme + 2 Redudndanz


Best-Practices: -10
CleanCode: -15
Testumfang: 50,1
 */

const setup = (users: User[] = []) => {
    const setUsers = jest.fn();
    render(<AddUserFormMittel users={users} setUsers={setUsers} />);
    return { setUsers };
};

describe('AddUserFormMittel', () => {
    it('should render without errors', () => {
        setup();
        expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should render all required input fields', () => {
        setup();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    // Test is successful but a false positive since label could not be found, even if it was present
    it.only('should initially not show the department input', () => {
        setup();
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should display department input when user selects admin or employee role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    describe('Input Validation', () => {
        it('should display error message when password is shorter than 8 characters', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, '1234567');
            expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        });

        it('should display error message when password does not contain an uppercase letter', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, 'abcdefg1!');
            expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        });

        it('should display error message when password does not contain a lowercase letter', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, 'ABCDEFG1!');
            expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        });

        it('should display error message when password does not contain a digit', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, 'AbcDefg!');
            expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        });

        it('should display error message when password does not contain a special character', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, 'AbcDefg1');
            expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
        });

        it('should not display error message when password fulfills all criteria', async () => {
            setup();
            const passwordInput = screen.getByLabelText('Password');
            await userEvent.type(passwordInput, 'Abcdefg1!');

            expect(screen.queryByText('Password needs to be 8 characters long')).not.toBeVisible();
            expect(
                screen.queryByText('Needs to contain at least one uppercase and one lowercase letter'),
            ).not.toBeVisible();
            expect(screen.queryByText('Needs to contain at least one digit')).not.toBeVisible();
            expect(screen.queryByText('Needs to contain at least one special character')).not.toBeVisible();
        });
    });

    describe('Form Submission', () => {
        it('should call setUsers with updated user list on submit', async () => {
            const existingUsers: User[] = [
                {
                    id: '1',
                    name: 'Test User',
                    email: 'test@test.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'TestPassword1!',
                },
            ];
            const { setUsers } = setup(existingUsers);
            const nameInput = screen.getByLabelText('Name');
            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const roleSelect = screen.getByLabelText('Role');
            const submitButton = screen.getByRole('button', { name: 'Add User' });

            await userEvent.type(nameInput, 'New User');
            await userEvent.type(emailInput, 'newuser@test.com');
            await userEvent.type(passwordInput, 'NewUserPassword1!');
            await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
            await userEvent.click(submitButton);

            expect(setUsers).toHaveBeenCalledWith([
                ...existingUsers,
                {
                    name: 'New User',
                    email: 'newuser@test.com',
                    password: 'NewUserPassword1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });

        it('should display error message when trying to add a user with an already existing email', async () => {
            const existingUsers: User[] = [
                {
                    id: '1',
                    name: 'Test User',
                    email: 'test@test.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'TestPassword1!',
                },
            ];
            setup(existingUsers);
            const nameInput = screen.getByLabelText('Name');
            const emailInput = screen.getByLabelText('Email');
            const passwordInput = screen.getByLabelText('Password');
            const roleSelect = screen.getByLabelText('Role');
            const submitButton = screen.getByRole('button', { name: 'Add User' });

            await userEvent.type(nameInput, 'New User');
            await userEvent.type(emailInput, 'test@test.com');
            await userEvent.type(passwordInput, 'NewUserPassword1!');
            await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
            await userEvent.click(submitButton);

            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });
});
