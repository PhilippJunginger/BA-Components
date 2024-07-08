import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- missing assertions - 2
- condition in test

- vairablen - 2
- overly complicated tests with loops


- 9 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -15
Tetumfang: 80
 */

const generateUser = (index: number): UserNoPw => ({
    name: `User ${index}`,
    email: `user${index}@example.com`,
    role: index % 3 === 0 ? USER_ROLE.ADMIN : index % 2 === 0 ? USER_ROLE.EMPLOYEE : USER_ROLE.CUSTOMER,
});

const generateUserList = (count: number): UserNoPw[] => Array.from({ length: count }, (_, i) => generateUser(i + 1));

describe('UserEmployeeListMittel Component', () => {
    const testUsers: UserNoPw[] = generateUserList(10);

    it('should render the component with the correct title', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        testUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
                expect(screen.getByText(user.email)).toBeVisible();
            });
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'User 3');
        expect(screen.getByText('User 3')).toBeVisible();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });

        // Sort by email
        await userEvent.click(within(sortBySelect).getByLabelText('Email'));
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('user1@example.com');

        // Sort by name
        await userEvent.click(within(sortBySelect).getByLabelText('Name'));
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('User 1');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });

        // Filter by EMPLOYEE
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        testUsers.forEach((user) => {
            if (user.role === USER_ROLE.EMPLOYEE) {
                expect(screen.getByText(user.name)).toBeVisible();
            } else {
                expect(screen.queryByText(user.name)).not.toBeInTheDocument();
            }
        });
    });

    it('should paginate the user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeVisible();
        // Assuming 5 rows per page, there should be two pages
        expect(within(pagination).getAllByRole('button').length).toBe(2);
    });

    it('should display a message when no users match the search criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should display a message when there are no users available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteUserButton);
        expect(screen.queryByText(testUsers[0].email)).not.toBeInTheDocument();
    });

    it('should display a snackbar message after removing a user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteUserButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('should navigate to the edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const editUserButton = screen.getAllByLabelText(/edit/i)[0];
        await userEvent.click(editUserButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
