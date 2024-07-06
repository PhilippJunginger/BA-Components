import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- node access
- conditional expect

- unused import

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 3 Redundazen


Best-Practices: -30
CleanCode: -5
Testumfang: 41,75
 */

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const users: UserNoPw[] = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            email: `test${i}@test.com`,
            name: `Test User ${i}`,
            role: i % 3 === 0 ? USER_ROLE.ADMIN : i % 3 === 1 ? USER_ROLE.EMPLOYEE : USER_ROLE.CUSTOMER,
        });
    }
    return users;
};

describe('UserEmployeeListLeicht Component', () => {
    const testUsers = generateTestUsers(10);

    it('should render the component with the correct title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('should display a "no users" message when no users are provided', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const noUsersMessage = screen.getByText('There are no users available');
        expect(noUsersMessage).toBeVisible();
    });

    it('should render a list of users when users are provided', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            if (user.role !== USER_ROLE.CUSTOMER) {
                const userListItem = screen.getByText(user.name);
                expect(userListItem).toBeVisible();
            }
        });
    });

    it.skip('should filter the user list based on the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Test User 3');
        expect(screen.getByText('Test User 3')).toBeVisible();
        testUsers.forEach((user) => {
            if (user.name !== 'Test User 3' && user.role !== USER_ROLE.CUSTOMER) {
                const userListItem = screen.queryByText(user.name);
                expect(userListItem).not.toBeVisible();
            }
        });
    });

    it('should sort the user list by name by default', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userListItemNames = screen
            .getAllByRole('listitem')
            .map((item) => item.textContent?.split('\n')[0])
            .filter((name) => name !== undefined) as string[];
        const sortedNames = [...userListItemNames].sort((a, b) => a.localeCompare(b));
        expect(userListItemNames).toEqual(sortedNames);
    });

    it('should sort the user list by email when the email sort option is selected', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userListItemEmails = screen
            .getAllByRole('listitem')
            .map((item) => item.textContent?.split('\n')[1])
            .filter((email) => email !== undefined) as string[];
        const sortedEmails = [...userListItemEmails].sort((a, b) => a.localeCompare(b));
        expect(userListItemEmails).toEqual(sortedEmails);
    });

    it('should remove a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userToDelete = testUsers.find((user) => user.role !== USER_ROLE.CUSTOMER) as UserNoPw;
        const deleteButton = screen.getByLabelText(`delete-${userToDelete.name}`);
        await userEvent.click(deleteButton);
        expect(screen.queryByText(userToDelete.name)).not.toBeInTheDocument();
    });

    it('should display the correct icon based on the user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            if (user.role !== USER_ROLE.CUSTOMER) {
                const userListItem = screen.getByText(user.name).closest('li')!;
                const iconElement = userListItem.querySelector('svg');
                if (user.role === USER_ROLE.ADMIN) {
                    expect(iconElement).toHaveAttribute('data-testid', 'BadgeIcon');
                } else if (user.role === USER_ROLE.EMPLOYEE) {
                    expect(iconElement).toHaveAttribute('data-testid', 'SupervisorAccountIcon');
                }
            }
        });
    });
});
