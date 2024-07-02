import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- clean code: Verwendung von einer render Funktion
- clean code: Keine Variable benutzt für Prüfung von Eingaben - 2 mal
- clean code: unused import
- clean code: Doppelung von screen... aufrufen

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen

Best-Practices: 0
CleanCode: -20
Testumfang: 75
 */

describe('AddUserFormLeicht Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    const renderComponent = () => {
        render(<AddUserFormLeicht users={initialUsers} setUsers={mockSetUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all input fields and submit button', () => {
        renderComponent();

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it.skip('should show an error message if email is already taken', async () => {
        renderComponent();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/email already exists!/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('should show an error message if password does not meet criteria', async () => {
        renderComponent();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'pass');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it.skip('should add a new user if form is valid', async () => {
        renderComponent();

        await user.type(screen.getByLabelText(/name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...initialUsers,
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ]);
    });

    it.skip('should show department input if role is admin or employee', async () => {
        renderComponent();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('should update state when input fields change', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });
});
