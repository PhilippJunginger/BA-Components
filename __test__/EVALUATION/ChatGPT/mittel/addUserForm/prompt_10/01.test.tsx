import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von  fireEvent
- critical: userEvent.setup() nicht verwendet

- initialProps spreading
- unnecessary awaiting of a promise
- clean code: keine variablen erstellt - 2 mal


- 3 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -20
Testumfang: 33,4
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        setUsers: mockSetUsers,
        users: [],
    };

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('renders form fields correctly', () => {
        render(<AddUserFormMittel {...initialProps} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it.skip('handles input changes correctly', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.type(nameInput, 'John Doe');
        expect(nameInput).toHaveValue('John Doe');

        await userEvent.type(emailInput, 'john@example.com');
        expect(emailInput).toHaveValue('john@example.com');

        await userEvent.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');

        fireEvent.mouseDown(roleSelect);
        const listbox = screen.getByRole('listbox');
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('displays password error messages correctly', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/i);

        await userEvent.type(passwordInput, 'pass');
        fireEvent.blur(passwordInput);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it('displays error message if email is already taken', async () => {
        const users = [{ name: 'Jane', email: 'jane@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' }];
        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await userEvent.type(emailInput, 'jane@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.submit(submitButton);

        expect(screen.getByText(/Es ist ein Fehler aufgetreten/i)).toBeInTheDocument();
    });

    it.skip('calls setUsers on successful form submission', async () => {
        const users = [];
        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await userEvent.type(nameInput, 'John Doe');
        await userEvent.type(emailInput, 'john@example.com');
        await userEvent.type(passwordInput, 'Password123!');
        fireEvent.mouseDown(roleSelect);
        const listbox = screen.getByRole('listbox');
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        const submitButton = screen.getByRole('button', { name: /Add User/i });
        fireEvent.submit(submitButton);

        await new Promise((resolve) => setTimeout(resolve, 0)); // wait for async actions

        expect(mockSetUsers).toHaveBeenCalled();
    });
});
