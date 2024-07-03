import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: too many assertions waitFor
- critical: render in beforeEach

- missing import within
- clean code: Doppelung - keine variablen erstellt - 5 mal


- 3 von 6 notwendigen Testumfang erreicht + 5 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 8,35
*/

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [];

    beforeEach(() => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should render the form with all fields', () => {
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show entered value in the name field', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        await user.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');
    });

    it('should show entered value in the email field', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');
    });

    it('should show entered value in the password field', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it.skip('should change value of select field', async () => {
        const roleSelect = screen.getByLabelText(/Role/i);
        fireEvent.mouseDown(roleSelect);
        const listbox = await screen.findByRole('listbox');
        const option = within(listbox).getByText(USER_ROLE.ADMIN);
        fireEvent.click(option);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages when password is invalid', async () => {
        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(
                screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
            ).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
            expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it('should show error alert when email is already taken', async () => {
        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'existing.email@example.com');
        fireEvent.blur(emailInput);

        const addUserButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.click(addUserButton);

        await waitFor(() => {
            expect(screen.getByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
        });
    });

    it.skip('should call setUsers with new user when form is submitted successfully', async () => {
        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        fireEvent.mouseDown(roleSelect);
        const listbox = await screen.findByRole('listbox');
        const option = within(listbox).getByText(USER_ROLE.ADMIN);
        fireEvent.click(option);

        const addUserButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.click(addUserButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                {
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: USER_ROLE.ADMIN,
                    password: 'Password123!',
                },
            ]);
        });
    });
});
