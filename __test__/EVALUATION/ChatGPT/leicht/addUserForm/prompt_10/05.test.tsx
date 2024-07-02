import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*
- critical: Verwendung von fireEvent

- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal
- import missing

- 4 von 4 notwendigem Testumfang erreicht + 1 Ausnahme + 1 Redundanzen

Best-Practices: -10
CleanCode: -10
Testumfang: 87,5
 */

describe('AddUserFormLeicht Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const existingUsers: User[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render form fields correctly', () => {
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    it('should display password error if password is invalid', async () => {
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'pass');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    it.skip('should display email error if email already exists', async () => {
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText(/Email/i);
        await user.type(emailInput, 'john.doe@example.com');
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it.skip('should call setUsers with new user data when form is submitted successfully', async () => {
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/Name/i);
        const emailInput = screen.getByLabelText(/Email/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const roleSelect = screen.getByLabelText(/Role/i);

        await user.type(nameInput, 'Jane Smith');
        await user.type(emailInput, 'jane.smith@example.com');
        await user.type(passwordInput, 'Password1!');
        fireEvent.mouseDown(roleSelect);
        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText(USER_ROLE.ADMIN));

        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...existingUsers,
            {
                name: 'Jane Smith',
                email: 'jane.smith@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password1!',
                department: '',
            },
        ]);
    });

    it('should show department field if role is not CUSTOMER', async () => {
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText(/Role/i);

        fireEvent.mouseDown(roleSelect);
        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText(USER_ROLE.ADMIN));

        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    });

    it('should not show department field if role is CUSTOMER', async () => {
        render(<AddUserFormLeicht users={existingUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText(/Role/i);

        fireEvent.mouseDown(roleSelect);
        const listbox = screen.getByRole('listbox');
        fireEvent.click(within(listbox).getByText(USER_ROLE.CUSTOMER));

        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
