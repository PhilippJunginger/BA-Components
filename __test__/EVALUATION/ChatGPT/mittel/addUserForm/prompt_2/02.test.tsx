import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*

- clean code: doppelung von userEvent.setup()
- unused import
- clean code: unnecessary module mock
- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal

- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -25
Testumfang: 66,8
 */

describe('AddUserFormMittel', () => {
    const setUsers = jest.fn();
    const initialUsers: User[] = [];

    const setup = () => {
        render(<AddUserFormMittel setUsers={setUsers} users={initialUsers} />);
    };

    beforeEach(() => {
        setUsers.mockClear();
    });

    it.skip('should render the form with initial state', () => {
        setup();

        expect(screen.getByRole('heading', { name: /create new user/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toHaveValue('');
        expect(screen.getByLabelText(/email/i)).toHaveValue('');
        expect(screen.getByLabelText(/password/i)).toHaveValue('');
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it('should handle input changes', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        expect(screen.getByLabelText(/name/i)).toHaveValue('John Doe');

        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        expect(screen.getByLabelText(/email/i)).toHaveValue('john@example.com');

        await user.type(screen.getByLabelText(/password/i), 'Password1!');
        expect(screen.getByLabelText(/password/i)).toHaveValue('Password1!');
    });

    it('should validate password and show error messages', async () => {
        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/password/i), 'pass');
        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should handle role selection and show department field for ADMIN/EMPLOYEE', async () => {
        setup();
        const user = userEvent.setup();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/role/i)).toHaveValue(USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();

        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);
        expect(screen.getByLabelText(/role/i)).toHaveValue(USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText(/department/i)).not.toBeInTheDocument();
    });

    it.skip('should handle form submission with valid inputs', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password1!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(fetch).toHaveBeenCalledWith('http://localhost:8080/user', {
            method: 'POST',
            body: JSON.stringify({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password1!',
                role: USER_ROLE.CUSTOMER,
            }),
        });
        expect(setUsers).toHaveBeenCalledWith([
            ...initialUsers,
            {
                name: 'John Doe',
                email: 'john@example.com',
                password: 'Password1!',
                role: USER_ROLE.CUSTOMER,
            },
        ]);
    });

    it.skip('should handle form submission with duplicate email error', async () => {
        const existingUsers = [
            { name: 'Jane', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ];
        render(<AddUserFormMittel setUsers={setUsers} users={existingUsers} />);
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'jane@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password1!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(setUsers).not.toHaveBeenCalled();
        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
    });

    it.skip('should handle API call failure', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({ message: 'Bad Request' }),
            }),
        ) as jest.Mock;

        setup();
        const user = userEvent.setup();

        await user.type(screen.getByLabelText(/name/i), 'John Doe');
        await user.type(screen.getByLabelText(/email/i), 'john@example.com');
        await user.type(screen.getByLabelText(/password/i), 'Password1!');
        await user.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.CUSTOMER);

        await user.click(screen.getByRole('button', { name: /add user/i }));

        expect(screen.getByText(/es ist ein fehler aufgetreten!/i)).toBeInTheDocument();
        expect(setUsers).not.toHaveBeenCalled();
    });
});
