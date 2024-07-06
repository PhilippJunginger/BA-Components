import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- node access

- typeerror
- variable - 5

- 4 von 10 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -20
CleanCode: -30
Testumfang: 30
 */

// Sample Data
const dummyUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Jones', email: 'peter.jones@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with users', () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays the correct number of user list items', () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(dummyUsers.length);
    });

    // Developer 1 Test
    it('filters users by name search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    // Developer 2 Test
    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        // Assuming the default sort is by name, check if already sorted
        expect(screen.getByText('John Doe')).precede(screen.getByText('Jane Smith'));
        expect(screen.getByText('Jane Smith')).precede(screen.getByText('Peter Jones'));

        // Toggle sort order to email and back to name
        const sortBySelect = screen.getByRole('combobox');
        await userEvent.click(sortBySelect);
        await userEvent.click(screen.getByText('Email')); // Select 'Email'
        await userEvent.click(sortBySelect);
        await userEvent.click(screen.getByText('Name')); // Select 'Name'

        // Check if order is still correct after toggling
        expect(screen.getByText('John Doe')).precede(screen.getByText('Jane Smith'));
        expect(screen.getByText('Jane Smith')).precede(screen.getByText('Peter Jones'));
    });

    // Developer 3 Test
    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.click(filterSelect);
        await userEvent.click(screen.getByText('EMPLOYEE'));
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.getByText('Peter Jones')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    // Collaborative Test: Pagination
    it('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);

        // By default, should show first 5 users
        expect(screen.getByText('John Doe')).toBeVisible();

        // Navigate to the next page
        const nextPageButton = screen.getByRole('button', { name: 'Go to next page' });
        await userEvent.click(nextPageButton);

        // Since we have less than 10 users, expect to see no users on the second page
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    // Collaborative Test: Delete User
    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const deleteUserButton = screen.getAllByLabelText('delete')[0]; // Get the first delete button
        await userEvent.click(deleteUserButton);

        // Snackbar should appear
        expect(screen.getByText('User removed successfully!')).toBeVisible();

        // User should be removed from the list
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    // Add more tests as needed to achieve full test coverage
});
