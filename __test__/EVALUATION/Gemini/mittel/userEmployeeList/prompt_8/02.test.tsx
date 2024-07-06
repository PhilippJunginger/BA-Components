import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion

- variable - 4
- unused import

- 6 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -20
CleanCode: -25
Testumfang: 55
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Pan', email: 'peter.pan@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    it('should render the component with the user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter the user list based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort the user list by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup');
        await userEvent.click(sortBySelect);
        const nameOption = screen.getByLabelText('Name');
        await userEvent.click(nameOption);
        const firstUser = screen.getAllByRole('listitem')[0];
        expect(firstUser).toHaveTextContent('John Doe');
    });

    it('should filter the user list by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleSelect);
        const employeeOption = screen.getByText('EMPLOYEE');
        await userEvent.click(employeeOption);
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should paginate the user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Add assertions to check if only the first page of users is displayed
        // and then interact with the pagination to test further.
    });

    it('should display a message when no users match the search criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteUserButton = screen.getAllByLabelText('delete')[0];
        await userEvent.click(deleteUserButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should display a snackbar message after removing a user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteUserButton = screen.getAllByLabelText('delete')[0];
        await userEvent.click(deleteUserButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('should navigate to the edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editUserButton = screen.getAllByLabelText('edit')[0];
        await userEvent.click(editUserButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
