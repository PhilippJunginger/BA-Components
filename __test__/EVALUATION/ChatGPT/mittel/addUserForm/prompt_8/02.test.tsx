import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: too many assertions waitFor
- critical: render in beforeEach

- unnecessary waitFor - 3 mal
- clean code: Doppelung - keine variablen erstellt - 5 mal


- 3 von 6 notwendigen Testumfang erreicht + 5 Redundanz


Best-Practices: -20
CleanCode: -40
Testumfang: 8,35
*/

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();

    const mockUsers = [];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form with all fields', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show entered value in the name field', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');
    });

    it('should show entered value in the email field', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'jane.doe@example.com');
        expect(emailInput).toHaveValue('jane.doe@example.com');
    });

    it('should show entered value in the password field', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('should change value of select field', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const roleSelect = screen.getByLabelText(/Role/i);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show error message if email is already taken', async () => {
        const existingUsers = [
            { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormMittel setUsers={mockSetUsers} users={existingUsers} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john.doe@example.com');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it('should show password error messages if password does not meet criteria', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(
                screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it.skip('should call setUsers with new user on successful form submission', async () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]);
        });
    });
});
