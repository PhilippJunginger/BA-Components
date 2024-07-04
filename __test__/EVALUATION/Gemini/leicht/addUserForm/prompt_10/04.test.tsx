import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*


- doppelung userEvent setup
- doppelung variablen - 2
- TypeError
- unnötige const

- 4 von 4 notwendigem Testumfang erreicht + 1 Redundanz


Best-Practices: 0
CleanCode: -25
Testumfang: 87,5
 */

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const initialUsers: User[] = [];

    beforeEach(() => {
        jest.clearAllMocks(); // Clear any mock data from previous tests
        mockSetUsers.mockReset();
    });

    it('renders the form correctly', () => {
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('adds a new user with valid data', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'ValidPassword123!');
        await user.selectOptions(screen.getByLabelText('Role'), 'CUSTOMER');
        await user.click(screen.getByText('Add User'));

        expect(mockSetUsers).toHaveBeenCalledWith([
            { name: 'John Doe', email: 'john.doe@example.com', password: 'ValidPassword123!', role: 'CUSTOMER' },
        ]);
        expect(screen.queryByText('Email already exists!')).not.toBeInTheDocument();
    });

    it('shows an error for an existing email', async () => {
        const existingUsers = [
            { name: 'Jane Doe', email: 'jane.doe@example.com', password: 'Password123!', role: 'CUSTOMER' },
        ];
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={existingUsers} />);

        await user.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('shows an error for an invalid password', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.type(screen.getByLabelText('Password'), 'invalid'); // Too short
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('shows additional fields for non-customer roles', async () => {
        const user = userEvent.setup();
        render(<AddUserFormLeicht setUsers={mockSetUsers} users={initialUsers} />);

        await user.selectOptions(screen.getByLabelText('Role'), 'ADMIN');
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });

    // Add more tests for edge cases and error handling
});
