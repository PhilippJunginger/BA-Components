import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*


- unused import
- clean code: Doppelung von screen... - 2 mal
- clean code: keine variablen erstellt - 3 mal


- 4 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 50,1
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const initialUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form fields correctly', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should show password error messages for invalid password', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        const passwordInput = screen.getByLabelText(/Password/i);
        await user.type(passwordInput, 'short');

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should add user and clear form on successful submission', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText(/Name/i), 'Jane Doe');
        await user.type(screen.getByLabelText(/Email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/Password/i), 'Password123!');
        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /Add User/i }));

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...initialUsers,
                {
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'Password123!',
                },
            ]);
        });

        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });

    it('should show error message when email is already taken', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it('should hide error message when close button is clicked', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText(/Email/i), 'john@example.com');
        await user.click(screen.getByRole('button', { name: /Add User/i }));

        expect(await screen.findByText(/Es ist ein Fehler aufgetreten!/i)).toBeInTheDocument();

        await user.click(screen.getByLabelText(/close-icon/i));
        expect(screen.queryByText(/Es ist ein Fehler aufgetreten!/i)).not.toBeInTheDocument();
    });

    it.skip('should show department field when role is admin or employee', async () => {
        const user = userEvent.setup();
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);

        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/Role/i), USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });
});
