import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*


- unused import
- render Funktion erstellt
- Doppelung userevent.setup()
- clean code: keine variablen erstellt


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme +  2 Redundanz


Best-Practices: 0
CleanCode: -20
Testumfang: 50,1
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    const setup = () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('should render the form with initial values', () => {
        setup();

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    it('should display validation error messages for invalid password', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');

        expect(await screen.findByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('should allow valid password', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Valid123!');

        expect(screen.queryByText(/Password needs to be 8 characters long/i)).not.toBeInTheDocument();
    });

    it.skip('should display error when email is already taken', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should submit form with valid inputs', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalled();
    });

    it.skip('should display department field when role is not customer', async () => {
        setup();
        const user = userEvent.setup();

        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should not display department field when role is customer', async () => {
        setup();

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    it.skip('should clear form after successful submission', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });
});
