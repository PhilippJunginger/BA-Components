import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';

/*

- unused import - 2 mal
- doppelung userEvent.setup
- clean code: Doppelung - keine variablen - 2 mal
- doppelung screen

- 3 von 4 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -30
Testumfang: 87,5
 */

// Mock function to avoid actually updating state in the parent component
const mockSetUsers = jest.fn();

describe('AddUserFormLeicht Component', () => {
    // Sample user data
    const testUsers: User[] = [
        { name: 'Existing User', email: 'existing@test.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
    ];

    // Function to set up the component for testing
    const renderComponent = (users = testUsers) => {
        return render(<AddUserFormLeicht users={users} setUsers={mockSetUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the form correctly', () => {
        renderComponent();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('adds a new user with valid data', async () => {
        renderComponent();

        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Name'), 'New User');
        await user.type(screen.getByLabelText('Email'), 'new@test.com');
        await user.type(screen.getByLabelText('Password'), 'Password1!');
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.CUSTOMER);

        await user.click(screen.getByText('Add User'));

        expect(mockSetUsers).toHaveBeenCalledTimes(1);
        expect(mockSetUsers).toHaveBeenCalledWith([
            ...testUsers,
            { name: 'New User', email: 'new@test.com', role: USER_ROLE.CUSTOMER, password: 'Password1!' },
        ]);
    });

    it('displays errors for invalid password', async () => {
        renderComponent();

        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Password'), 'short');
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
    });

    it('displays errors for existing email', async () => {
        renderComponent();

        const user = userEvent.setup();

        await user.type(screen.getByLabelText('Email'), 'existing@test.com');
        await user.click(screen.getByText('Add User'));

        expect(screen.getByText('Email already exists!')).toBeInTheDocument();
    });

    it('displays department field when role is admin or employee', async () => {
        renderComponent();

        const user = userEvent.setup();

        // Select Admin Role
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();

        // Select Employee Role
        await user.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);
        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
