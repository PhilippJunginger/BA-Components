import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*

-TypeError global.fetch
- clean code: Doppelung - keine variablen erstellt - 2 mal
- initialProps


- 4 von 6 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: 0
CleanCode: -20
Testumfang: 58,45
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    const user = userEvent.setup();

    it('should render the form fields correctly', () => {
        render(<AddUserFormMittel {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    it('should allow user to type in the name field', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'John Doe');

        expect(nameInput).toHaveValue('John Doe');
    });

    it('should display password validation errors', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should change role when a new option is selected', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not customer', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should show an error if email is already taken', async () => {
        const props = {
            users: [{ name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' }],
            setUsers: mockSetUsers,
        };
        render(<AddUserFormMittel {...props} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane@example.com');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should call setUsers with new user on form submit', async () => {
        const newUser = {
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password1!',
        };
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 201,
                json: () => Promise.resolve(newUser),
            }),
        );

        render(<AddUserFormMittel {...initialProps} />);

        await user.type(screen.getByLabelText(/Name/i), newUser.name);
        await user.type(screen.getByLabelText(/Email/i), newUser.email);
        await user.type(screen.getByLabelText(/Password/i), newUser.password);
        await user.click(screen.getByLabelText(/Role/i));
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([newUser]);
    });
});
