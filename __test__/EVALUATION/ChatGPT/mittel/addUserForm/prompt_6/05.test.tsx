import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*

- TypeError global.fetch
- clean code: Doppelung - keine variablen erstellt - 3 mal
- unused import
- render Funktion


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 1 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 75,15
*/

describe('AddUserFormMittel', () => {
    const user = userEvent.setup();

    const setup = () => {
        const setUsers = jest.fn();
        const users = [];
        render(<AddUserFormMittel setUsers={setUsers} users={users} />);
        return { setUsers };
    };

    it('should render form elements correctly', () => {
        setup();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show error message for invalid password', async () => {
        setup();
        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');

        expect(await screen.findByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it('should change role and show department input for non-customer roles', async () => {
        setup();
        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it.skip('should add a user when the form is correctly filled out', async () => {
        const { setUsers } = setup();
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(setUsers).toHaveBeenCalledWith(
                expect.arrayContaining([
                    {
                        name: 'John Doe',
                        email: 'john.doe@example.com',
                        role: USER_ROLE.CUSTOMER,
                        password: 'Password123!',
                    },
                ]),
            );
        });
    });

    it('should show error message if email is already taken', async () => {
        const setUsers = jest.fn();
        const users = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormMittel setUsers={setUsers} users={users} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should close error message on close button click', async () => {
        const setUsers = jest.fn();
        const users = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormMittel setUsers={setUsers} users={users} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.CUSTOMER));

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close-icon');
        await user.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
        });
    });
});
