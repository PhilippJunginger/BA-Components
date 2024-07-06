import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion

- variable - 5

- 5 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -20
CleanCode: -25
Testumfang: 45
 */

const testUsers: UserNoPw[] = [
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'John Smith', email: 'john.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        const nameRadioButton = within(sortBySelect).getByLabelText('Name');
        await userEvent.click(nameRadioButton);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice Johnson'); // Expect Alice first due to sorting
        expect(userItems[1]).toHaveTextContent('Jane Doe');
        expect(userItems[2]).toHaveTextContent('John Smith');
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Smith')).not.toBeInTheDocument();
    });

    it('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        // Default should show first 2 users (rowsPerPage is 2 in the component)
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();

        // Navigate to the next page
        const pagination = screen.getByRole('navigation');
        const nextPageButton = within(pagination).getByRole('button', { name: 'Go to next page' });
        await userEvent.click(nextPageButton);

        // Expect the third user to be visible now
        expect(screen.getByText('Alice Johnson')).toBeVisible();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByRole('button', { name: /delete-/i })[0];
        await userEvent.click(deleteUserButton);
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('shows a snackbar message after removing a user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByRole('button', { name: /delete-/i })[0];
        await userEvent.click(deleteUserButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('navigates to the edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const editUserButton = screen.getAllByRole('button', { name: /edit-/i })[0];
        await userEvent.click(editUserButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
