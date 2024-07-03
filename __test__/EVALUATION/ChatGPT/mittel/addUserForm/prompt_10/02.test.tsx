import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*
- critical: Verwendung von  fireEvent

- unused const - 2 mal
- unnecessary waitFor - 2 mal
- clean code: keine variablen erstellt - 3 mal


- 4 von 6 notwendigen Testumfang erreicht + 3 Redundanz


Best-Practices: -10
CleanCode: -35
Testumfang: 58,45
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
    ];

    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('should show entered value in name and email fields', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane.doe@example.com');

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane.doe@example.com');
    });

    it('should display password error messages', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const passwordInput = screen.getByLabelText(/password/i);

        await user.type(passwordInput, 'pass');
        fireEvent.blur(passwordInput);

        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        });
    });

    it.skip('should change value of role field', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText(/role/i);

        fireEvent.mouseDown(roleSelect);
        const listbox = await screen.findByRole('listbox');
        await user.click(screen.getByText(/admin/i));

        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show department field when role is not customer', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const roleSelect = screen.getByLabelText(/role/i);

        fireEvent.mouseDown(roleSelect);
        const listbox = await screen.findByRole('listbox');
        await user.click(screen.getByText(/admin/i));

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const emailInput = screen.getByLabelText(/email/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(emailInput, 'john.doe@example.com');
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    it('should add user when form is submitted successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const roleSelect = screen.getByLabelText(/role/i);
        const submitButton = screen.getByRole('button', { name: /add user/i });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        fireEvent.mouseDown(roleSelect);
        await user.click(screen.getByText(/customer/i));
        await user.click(submitButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...mockUsers,
                { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
        });
    });
});
