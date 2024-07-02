import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*


- unnötige render Funktion
- unused import
- unnötige await waitFor - 2 mal
- clean code: Doppelung - keine variablen erstellt in zweitem test - 3 mal
- clean code: Doppelung von userEvent.setup()


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundanz


Best-Practices: 0
CleanCode: -40
Testumfang: 66,8
*/

describe('AddUserFormMittel Component', () => {
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    const setup = () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={initialUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component', () => {
        setup();
        expect(screen.getByText('Create new User')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add User' })).toBeInTheDocument();
    });

    it('should update state on input change', async () => {
        setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');
        expect(passwordInput).toHaveValue('Password123!');
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should show password error messages', async () => {
        setup();
        const user = userEvent.setup();

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'short');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should show error if email is already taken', async () => {
        const existingUsers: User[] = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
        ];
        render(<AddUserFormMittel setUsers={mockSetUsers} users={existingUsers} />);
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane.doe@example.com');

        const addButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(addButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('should call setUsers with new user on successful submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const addButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(addButton);

        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                ...initialUsers,
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN, password: 'Password123!' },
            ]);
        });
    });

    it('should show error on failed submission', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 400,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;

        setup();
        const user = userEvent.setup();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john.doe@example.com');
        await user.type(passwordInput, 'Password123!');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);

        const addButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(addButton);

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    it('should hide error alert when close button is clicked', async () => {
        setup();
        const user = userEvent.setup();

        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, 'jane.doe@example.com');

        const addButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(addButton);

        const closeButton = screen.getByLabelText('close-icon');
        await user.click(closeButton);

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
