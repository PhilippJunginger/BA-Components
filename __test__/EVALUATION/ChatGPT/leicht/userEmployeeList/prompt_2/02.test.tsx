import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- unused import
- vairablen - 4
- render Funktion
- setup

- 5 von 6 notwendigen Testfälen erreicht + 1 Redundanzen


Best-Practices: 0
CleanCode: -30
Testumfang: 75,15
 */

describe('UserEmployeeListLeicht Component', () => {
    const fetchedUsers: UserNoPw[] = [
        { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
        { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
    ];

    it('should render the component with fetched users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.getByLabelText('Bob')).toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');

        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
    });

    it('should sort users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        // Initial sort by name
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        // Sorted by email
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    });

    it('should show alert when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should show alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should remove a user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument();
    });
});
