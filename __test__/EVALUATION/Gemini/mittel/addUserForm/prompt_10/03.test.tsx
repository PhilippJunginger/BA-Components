import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*


- userEvent.setup doppelung
- doppelung keine variable - 2
- TypeError - 2
- unnecessary const

- 2 von 6 notwendigem Testumfang erreicht + 1 Redundazen


Best-Practices: 0
CleanCode: -30
Testumfang: 25,05
 */

// Mock fetch to control API responses
global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('AddUserFormMittel Component', () => {
    const setUsers = jest.fn();
    const users = []; // Initial empty user list

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders form fields correctly', () => {
        render(<AddUserFormMittel setUsers={setUsers} users={users} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    it('shows error alert on email already taken', async () => {
        const existingUser = {
            name: 'John',
            email: 'john@example.com',
            role: USER_ROLE.ADMIN,
            password: 'password123',
        };
        render(<AddUserFormMittel setUsers={setUsers} users={[existingUser]} />);

        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'Jane');
        await user.type(screen.getByLabelText('Email'), 'john@example.com'); // Same email
        await user.type(screen.getByLabelText('Password'), 'password123');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
    });

    it('adds new user on successful submission', async () => {
        fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({}), // Mock API response
        });

        render(<AddUserFormMittel setUsers={setUsers} users={users} />);

        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'Jane');
        await user.type(screen.getByLabelText('Email'), 'jane@example.com');
        await user.type(screen.getByLabelText('Password'), 'Password123!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);
        await user.click(screen.getByText('Add User'));

        // Add assertions to check if setUsers was called with the correct updated user list
        expect(setUsers).toHaveBeenCalledWith([
            expect.objectContaining({
                name: 'Jane',
                email: 'jane@example.com',
                role: USER_ROLE.CUSTOMER,
                password: 'Password123!',
            }),
        ]);
    });

    // Add more tests for:
    // - Password validation errors
    // - Department field visibility based on role
    // - Form reset after submission
    // - Error handling for API failures
});
