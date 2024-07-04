import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';

/*


- userEvent.setup doppelung
- doppelung keine variable
- TypeError
- unnecessary const

- 3 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: 0
CleanCode: -20
Testumfang: 41,75
 */

// Mock fetch to control API response
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const users: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.only('renders without error', () => {
        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        expect(screen.getByText('Create new User')).toBeInTheDocument();
    });

    it('validates password requirements', async () => {
        const user = userEvent.setup();

        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, 'invalid'); // Invalid password
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('handles email duplication', async () => {
        const user = userEvent.setup();
        const existingUser: User = {
            name: 'John Doe',
            email: 'john@example.com',
            role: USER_ROLE.CUSTOMER,
            password: 'password123',
        };

        render(<AddUserFormMittel setUsers={mockSetUsers} users={[existingUser]} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByText('Add User');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'john@example.com'); // Duplicate email
        await user.type(passwordInput, 'validPassword123');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(addUserButton);

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('successfully adds a new user', async () => {
        const user = userEvent.setup();

        fetch.mockResolvedValueOnce({
            json: async () => ({ success: true }),
            status: 200,
        });

        render(<AddUserFormMittel setUsers={mockSetUsers} users={users} />);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const addUserButton = screen.getByText('Add User');

        await user.type(nameInput, 'Jane Doe');
        await user.type(emailInput, 'jane@example.com');
        await user.type(passwordInput, 'validPassword123');
        await user.selectOptions(roleSelect, USER_ROLE.CUSTOMER);
        await user.click(addUserButton);

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:8080/user',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    name: 'Jane Doe',
                    email: 'jane@example.com',
                    role: USER_ROLE.CUSTOMER,
                    password: 'validPassword123',
                }),
            }),
        );
        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.CUSTOMER, password: 'validPassword123' },
        ]);
    });

    // Add more tests for different roles (ADMIN, EMPLOYEE) and error scenarios
});
