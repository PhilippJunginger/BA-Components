import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*

- unnecessary await findBy - 2 mal
- clean code: Doppelung - keine variablen erstellt - 3 mal
- initialProps


- 3 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 33,4
*/

describe('AddUserFormMittel Component', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the form fields correctly', () => {
        render(<AddUserFormMittel {...initialProps} />);

        expect(screen.getByLabelText(/Name/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/ })).toBeInTheDocument();
    });

    it('should allow user to type into text fields', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        const emailInput = screen.getByLabelText(/Email/);
        await user.type(emailInput, 'jane.doe@example.com');
        expect(emailInput).toHaveValue('jane.doe@example.com');

        const passwordInput = screen.getByLabelText(/Password/);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');
    });

    it('should show error message if email is already taken', async () => {
        const existingUsers = [{ name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER }];
        render(<AddUserFormMittel {...initialProps} users={existingUsers} />);

        const emailInput = screen.getByLabelText(/Email/);
        await user.type(emailInput, 'john.doe@example.com');
        expect(emailInput).toHaveValue('john.doe@example.com');

        const submitButton = screen.getByRole('button', { name: /Add User/ });
        await user.click(submitButton);

        expect(await screen.findByText(/Es ist ein Fehler aufgetreten!/)).toBeInTheDocument();
    });

    it('should validate password criteria', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        const passwordInput = screen.getByLabelText(/Password/);
        await user.type(passwordInput, 'pass');
        expect(passwordInput).toHaveValue('pass');
        expect(await screen.findByText(/Password needs to be 8 characters long/)).toBeInTheDocument();
        expect(
            await screen.findByText(/Needs to contain at least one uppercase and one lowercase letter/),
        ).toBeInTheDocument();
        expect(await screen.findByText(/Needs to contain at least one digit/)).toBeInTheDocument();
        expect(await screen.findByText(/Needs to contain at least one special character/)).toBeInTheDocument();
    });

    it('should submit form and reset fields on success', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        render(<AddUserFormMittel {...initialProps} />);

        const nameInput = screen.getByLabelText(/Name/);
        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        const emailInput = screen.getByLabelText(/Email/);
        await user.type(emailInput, 'jane.doe@example.com');
        expect(emailInput).toHaveValue('jane.doe@example.com');

        const passwordInput = screen.getByLabelText(/Password/);
        await user.type(passwordInput, 'Password123!');
        expect(passwordInput).toHaveValue('Password123!');

        const roleSelect = screen.getByLabelText(/Role/);
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        const submitButton = screen.getByRole('button', { name: /Add User/ });
        await user.click(submitButton);

        expect(await screen.findByLabelText(/Name/)).toHaveValue('');
        expect(await screen.findByLabelText(/Email/)).toHaveValue('');
        expect(await screen.findByLabelText(/Password/)).toHaveValue('');
        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
        ]);
    });
});
