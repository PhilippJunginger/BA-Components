import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*


- unused import
- clean code: keine variablen erstellt - 2 mal


- 4 von 6 notwendigen Testumfang erreicht + 1 Ausnahme + 3 Redundanz


Best-Practices: 0
CleanCode: -15
Testumfang: 58,45
*/

describe('AddUserFormMittel', () => {
    const user = userEvent.setup();
    const mockSetUsers = jest.fn();
    const mockUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    const renderComponent = () => render(<AddUserFormMittel users={mockUsers} setUsers={mockSetUsers} />);

    beforeEach(() => {
        mockSetUsers.mockClear();
    });

    it('should render the form fields', () => {
        renderComponent();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('should update form fields correctly', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        await user.type(nameInput, 'Jane Doe');
        expect(nameInput).toHaveValue('Jane Doe');

        await user.type(emailInput, 'jane@example.com');
        expect(emailInput).toHaveValue('jane@example.com');

        await user.type(passwordInput, 'Password2!');
        expect(passwordInput).toHaveValue('Password2!');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(roleSelect).toHaveValue(USER_ROLE.ADMIN);
    });

    it('should display password error messages', async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');

        await user.type(passwordInput, 'short');
        expect(passwordInput).toHaveValue('short');
        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        expect(
            screen.getByText('Needs to contain at least one uppercase and one lowercase letter'),
        ).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one digit')).toBeInTheDocument();
        expect(screen.getByText('Needs to contain at least one special character')).toBeInTheDocument();
    });

    it('should add a new user on valid submission', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'Password2!');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);

        await user.click(addButton);

        expect(mockSetUsers).toHaveBeenCalledWith([
            ...mockUsers,
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password2!',
            },
        ]);
    });

    it('should not add a user with an already taken email', async () => {
        renderComponent();

        const emailInput = screen.getByLabelText('Email');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'john@example.com');
        await user.click(addButton);

        expect(mockSetUsers).not.toHaveBeenCalled();
        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('should display department field for non-customer roles', async () => {
        renderComponent();

        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        await user.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    it('should hide department field for customer role', async () => {
        renderComponent();

        const roleSelect = screen.getByLabelText('Role');

        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        expect(screen.queryByLabelText('Department')).not.toBeInTheDocument();
    });

    it('should close the error alert when close icon is clicked', async () => {
        renderComponent();

        const emailInput = screen.getByLabelText('Email');
        const addButton = screen.getByRole('button', { name: 'Add User' });

        await user.type(emailInput, 'john@example.com');
        await user.click(addButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close-icon');
        await user.click(closeButton);

        expect(screen.queryByText('Es ist ein Fehler aufgetreten!')).not.toBeInTheDocument();
    });
});
