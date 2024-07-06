import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- vairablen - 4
- unused import
- setup


- 5 von 6 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListLeicht Component', () => {
    it.skip('should render the user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');

        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
    });

    it('should show alert when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonExistingUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should show alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should sort users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const sortByName = screen.getByLabelText('Name');
        const sortByEmail = screen.getByLabelText('Email');

        // Default sort by name
        const firstUserByName = screen.getAllByRole('listitem')[0];
        expect(firstUserByName).toHaveTextContent('Alice');

        // Sort by email
        await user.click(sortByEmail);

        const firstUserByEmail = screen.getAllByRole('listitem')[0];
        expect(firstUserByEmail).toHaveTextContent('Alice'); // alice@example.com should come before bob@example.com
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });
});
