import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- assertions waitFor
- userEvent.setup missing

- doppelung keine Variable - 3
- unnecessary waitFor

- 3 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 33,4
 */

const mockUsers = [
    {
        name: 'Test User 1',
        email: 'test1@example.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
    },
];

// Mock the fetch function to avoid actual API calls
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({}),
        status: 200,
    }),
) as jest.Mock;

describe('AddUserFormMittel Component', () => {
    const setUsersMock = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render all input fields', () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
    });

    it('should update input fields correctly', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await userEvent.type(nameInput, 'Test User');
        await userEvent.type(emailInput, 'test@example.com');
        await userEvent.type(passwordInput, 'Testpassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('Test User');
        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('Testpassword1!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        // Type a password that doesn't meet the criteria
        await userEvent.type(passwordInput, 'short');
        await userEvent.click(submitButton);

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeVisible();
        expect(screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i)).toBeVisible();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeVisible();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeVisible();
    });

    it('should display an error message if email is already taken', async () => {
        render(<AddUserFormMittel users={mockUsers} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'Test User 2');
        await userEvent.type(emailInput, mockUsers[0].email); // Use the same email as mockUsers[0]
        await userEvent.type(passwordInput, 'Testpassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
        });
    });

    it('should add a new user when form is submitted with valid data', async () => {
        render(<AddUserFormMittel users={[]} setUsers={setUsersMock} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByRole('button', { name: /Add User/i });

        await userEvent.type(nameInput, 'Valid User');
        await userEvent.type(emailInput, 'valid@example.com');
        await userEvent.type(passwordInput, 'Validpassword1!');
        await userEvent.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(setUsersMock).toHaveBeenCalledWith([
                {
                    name: 'Valid User',
                    email: 'valid@example.com',
                    password: 'Validpassword1!',
                    role: USER_ROLE.CUSTOMER,
                },
            ]);
        });
    });
});
