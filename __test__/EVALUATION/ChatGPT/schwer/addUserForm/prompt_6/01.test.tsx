import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormSchwer from '../../../../../../components/schwierig/addUserFormSchwer';
import { USER_ROLE } from '../../../../../../models/user';

/*

- clean code: keine variablen erstellt - 3 mal
- TypeError
- initialProps spreading
- unnötige await findBy


- 4 von 7 notwendigen Testumfang erreicht + 1 Ausnahme + 2 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 42,9
*/

describe('AddUserFormSchwer Component', () => {
    const initialProps = {
        users: [],
        setUsers: jest.fn(),
    };

    const user = userEvent.setup();

    it('should display an error if the password does not meet criteria', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'weak');

        const errorMessage = await screen.findByText(/Password needs to be 8 characters long/);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should show entered value for name and email', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
    });

    it('should change value of select field for role', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const roleSelect = screen.getByLabelText('Role');

        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department input if role is not customer', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        const departmentInput = await screen.findByLabelText('Department');
        expect(departmentInput).toBeInTheDocument();
    });

    it('should not show department input if role is customer', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const roleSelect = screen.getByLabelText('Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.CUSTOMER }));

        const departmentInput = screen.queryByLabelText('Department');
        expect(departmentInput).not.toBeInTheDocument();
    });

    it('should display an error if email is already taken', async () => {
        const propsWithExistingUser = {
            ...initialProps,
            users: [
                { name: 'Existing User', email: 'existing@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ],
        };
        render(<AddUserFormSchwer {...propsWithExistingUser} />);

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'existing@example.com');

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(addButton);

        const errorAlert = await screen.findByText(/Es ist ein Fehler aufgetreten!/);
        expect(errorAlert).toBeInTheDocument();
    });

    it('should call setUsers with new user when form is submitted', async () => {
        render(<AddUserFormSchwer {...initialProps} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password1!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        const addButton = screen.getByRole('button', { name: /Add User/i });
        await user.click(addButton);

        await waitFor(() => {
            expect(initialProps.setUsers).toHaveBeenCalledWith([
                { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
            ]);
        });
    });
});
