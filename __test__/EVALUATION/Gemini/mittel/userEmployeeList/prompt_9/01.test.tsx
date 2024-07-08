import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- waitFor assertions
- setup
- fireEvent

- vairablen - 4
- unnecessary waitFor - 3

- 4 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -35
Tetumfang: 30
 */

// Mock the useRouter hook to prevent errors in tests
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListMittel Component', () => {
    const testUsers: UserNoPw[] = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Jim Smith', email: 'jim.smith@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    it('renders the component with the correct title', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it.skip('renders the correct number of users based on pagination', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        // Should initially render 5 users (default rowsPerPage)
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(testUsers.length);
    });

    it.skip('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'jane');
        // Wait for the component to update after the search
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(1);
            expect(listItems[0]).toHaveTextContent('Jane Doe');
        });
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const filterSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(filterSelect, { target: { value: USER_ROLE.ADMIN } });
        // Wait for the component to update after the filter change
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(1);
            expect(listItems[0]).toHaveTextContent('John Doe');
        });
    });

    it.skip('sorts users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortByRadios = screen.getAllByRole('radio');

        // Sort by email (descending order by default)
        await userEvent.click(sortByRadios[1]); // Click on 'Email' radio
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('John Doe'); // John is first alphabetically
        });

        // Sort by name (ascending order by default)
        await userEvent.click(sortByRadios[0]); // Click on 'Name' radio
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems[0]).toHaveTextContent('Jane Doe');
        });
    });

    it.skip('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteButtons = screen.getAllByLabelText(/delete/i);
        await userEvent.click(deleteButtons[0]);
        // Wait for the component to update after the delete
        await waitFor(() => {
            const listItems = screen.getAllByRole('listitem');
            expect(listItems).toHaveLength(testUsers.length - 1);
            expect(screen.queryByText('John Doe')).toBeNull(); // John should be removed
        });
        // Add assertions to check if the snackbar appears with the correct message
    });

    // ... (Add more tests for pagination, navigation, edge cases, etc.)
});
