import { render, screen, fireEvent } from '@testing-library/react';

import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- userEvent.setup fehlt
- conditional assertions

- forEach instead of it.each
- unused import
- setup FUnktion

- 4 von 6 notwendigem Testumfang erreicht + 1 Ausnahme + 2 Redudndanz


Best-Practices: -20
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

    it('should display department input if user is not a customer', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    describe('Password validation', () => {
        const testCases = [
            { input: 'Test1234', valid: false },
            { input: 'TestTest1', valid: false },
            { input: 'Testtest!', valid: false },
            { input: 'TestTestTest', valid: false },
            { input: 'T3stT3st!', valid: true },
        ];

        testCases.forEach(({ input, valid }) => {
            it(`should ${valid ? 'accept' : 'reject'} password input "${input}"`, async () => {
                setup();
                const passwordInput = screen.getByLabelText('Password');
                await userEvent.type(passwordInput, input);
                expect(screen.getByLabelText('Password')).toHaveValue(input);
                if (valid) {
                    expect(screen.getByLabelText('Password')).not.toBeInvalid();
                } else {
                    expect(screen.getByLabelText('Password')).toBeInvalid();
                }
            });
        });
    });

    it('should be able to add a new User', async () => {
        const testUser: User = {
            name: 'Test User',
            email: 'test@user.com',
            password: 'T3stUser!',
            role: USER_ROLE.CUSTOMER,
        };

        const { setUsers } = setup();
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, testUser.name);
        await userEvent.type(emailInput, testUser.email);
        await userEvent.type(passwordInput, testUser.password);
        await userEvent.selectOptions(roleSelect, testUser.role);
        await userEvent.click(submitButton);

        expect(setUsers).toHaveBeenCalledTimes(1);
        expect(setUsers).toHaveBeenCalledWith(expect.arrayContaining([testUser]));
    });

    it('should show an error message if email is already taken', async () => {
        const existingUser: User = {
            name: 'Existing User',
            email: 'existing@user.com',
            password: 'ExistingUser1!',
            role: USER_ROLE.CUSTOMER,
        };

        const testUser: User = {
            name: 'Test User',
            email: 'existing@user.com',
            password: 'TestUser1!',
            role: USER_ROLE.CUSTOMER,
        };

        const { setUsers } = setup([existingUser]);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: 'Add User' });

        await userEvent.type(nameInput, testUser.name);
        await userEvent.type(emailInput, testUser.email);
        await userEvent.type(passwordInput, testUser.password);
        await userEvent.selectOptions(roleSelect, testUser.role);
        await userEvent.click(submitButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        expect(setUsers).not.toHaveBeenCalled();
    });
});
