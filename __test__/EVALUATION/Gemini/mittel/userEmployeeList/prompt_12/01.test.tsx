import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- missing assertions - 2

- vairablen - 2


- 7 von 10 notwendigen Testfälen erreicht + 1 A + 2 Redundanz


Best-Practices: -30
CleanCode: -10
Tetumfang: 60
 */

const generateUser = (index: number): UserNoPw => ({
    name: `User ${index}`,
    email: `user${index}@example.com`,
    role: index % 3 === 0 ? USER_ROLE.ADMIN : index % 2 === 0 ? USER_ROLE.EMPLOYEE : USER_ROLE.CUSTOMER,
});

const generateUserList = (count: number): UserNoPw[] => Array.from({ length: count }, (_, i) => generateUser(i + 1));

describe('UserEmployeeListMittel Component', () => {
    const testUsers: UserNoPw[] = generateUserList(10);

    it('renders without crashing', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
    });

    it('renders the correct number of user list items', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(5); // Assuming rowsPerPage is 5
    });

    it('filters users based on search input', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'User 3');
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('combobox', { name: 'Sort by' });
        await userEvent.selectOptions(sortBySelect, 'name');
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('User 1')).toBeInTheDocument();
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('combobox', { name: 'Sort by' });
        await userEvent.selectOptions(sortBySelect, 'email');
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('user1@example.com')).toBeInTheDocument();
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(4); // Assuming 4 admins in testUsers
    });

    it('paginates user list correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const pagination = screen.getByRole('navigation');
        const pageButtons = within(pagination).getAllByRole('button');
        expect(pageButtons).toHaveLength(2); // Assuming 10 users and 5 rowsPerPage
        await userEvent.click(pageButtons[1]);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('User 6')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const firstDeleteButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(firstDeleteButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(4); // Assuming one user was removed
    });

    it('displays a snackbar message after removing a user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const firstDeleteButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(firstDeleteButton);
        const snackbar = screen.getByRole('alert');
        expect(snackbar).toBeVisible();
        expect(snackbar).toHaveTextContent('User removed successfully!');
    });

    it('navigates to the edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const firstEditButton = screen.getAllByLabelText(/edit/i)[0];
        await userEvent.click(firstEditButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
