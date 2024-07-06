import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*


- unused import
- vairablen - 6

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: 0
CleanCode: -35
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const fetchedUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with initial state', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByRole('list', { name: 'user-list' })).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should sort users based on selected criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const sortByEmail = screen.getByLabelText('Email');
        await user.click(sortByEmail);

        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Alice');
        expect(userList[1]).toHaveTextContent('Bob');
        expect(userList[2]).toHaveTextContent('Charlie');
    });

    it('should filter users based on role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await user.click(roleFilter);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should paginate users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const pagination = screen.getByRole('button', { name: '2' });
        await user.click(pagination);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should show snackbar message when user is removed', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const editButton = screen.getByLabelText('edit-Alice');
        await user.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    it('should show alert when no users match the search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should show alert when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
