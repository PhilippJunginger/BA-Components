import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { USER_ROLE } from '../../../../../../models/user';

/*
- render in beforeEach

- userEvent,setup doppelung
- doppelung - keine Varuable - 2 mal
- TypeError


- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanzen


Best-Practices: -10
CleanCode: -20
Testumfang: 62,5
 */

const mockSetUsers = jest.fn();
const mockUsers = [];

describe('AddUserFormLeicht Component', () => {
    beforeEach(() => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={mockUsers} />);
    });

    it('should render the form fields with correct labels', () => {
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();
        expect(passwordInput).toBeInTheDocument();
        expect(roleSelect).toBeInTheDocument();
    });

    it('should add a new user when form is submitted with valid data', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        await user.type(screen.getByLabelText('Department'), 'Sales');
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            {
                name: 'John Doe',
                email: 'john@example.com',
                role: USER_ROLE.ADMIN,
                password: 'Password123!',
                department: 'Sales',
            },
        ]);
    });

    it('should display an error message when email is already taken', async () => {
        const user = userEvent.setup();

        mockUsers.push({
            name: 'Existing User',
            email: 'existing@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'Password123!',
        });

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'existing@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        const emailError = screen.getByText('Email already exists!');
        expect(emailError).toBeInTheDocument();
        expect(mockSetUsers).not.toHaveBeenCalled();
    });

    it('should show password requirements when password is invalid', async () => {
        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john@example.com');
        await user.type(screen.getByLabelText('Password'), 'invalid'); // Invalid password
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByRole('button', { name: 'Add User' }));

        const passwordErrorListItems = screen.getAllByRole('listitem');
        expect(passwordErrorListItems).toHaveLength(4); // 4 password requirements
        expect(mockSetUsers).not.toHaveBeenCalled();
    });
});
