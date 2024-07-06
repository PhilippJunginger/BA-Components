import { render, screen, fireEvent } from '@testing-library/react';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent
- fireEVent
- node access

- variable
-typeerror

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -40
CleanCode: -10
Testumfang: 50,1
 */

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const users: UserNoPw[] = [];
    for (let i = 0; i < numUsers; i++) {
        users.push({
            email: `test${i}@example.com`,
            name: `Test User ${i}`,
            role: i % 3 === 0 ? USER_ROLE.ADMIN : USER_ROLE.EMPLOYEE,
        });
    }
    return users;
};

describe('UserEmployeeListLeicht Component', () => {
    const testUsers: UserNoPw[] = generateTestUsers(10);

    it('renders the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
        });
    });

    it('filters the user list based on search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'test5' } });
        expect(screen.getByText('Test User 5')).toBeVisible();
        expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });

    it.skip('sorts the user list by name or email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const sortByControl = screen.getByLabelText('Sort by');
        fireEvent.click(screen.getByLabelText('Email'));
        expect(sortByControl.querySelector('input[value="email"]')).toBeChecked();

        // Check if the list is sorted by email
        const listItems = screen.getAllByRole('listitem');
        for (let i = 1; i < listItems.length; i++) {
            const prevEmail = listItems[i - 1].querySelector('p:nth-child(2)')?.textContent;
            const currentEmail = listItems[i].querySelector('p:nth-child(2)')?.textContent;
            expect(prevEmail).toBeLessThanOrEqual(currentEmail!);
        }
    });

    it('removes a user from the list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userToRemove = testUsers[2];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        fireEvent.click(deleteButton);
        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
    });

    it('displays a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a message when no users match the search', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistentuser' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('renders correct icons for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const adminIcon = screen.getAllByTestId('BadgeIcon');
        const employeeIcon = screen.getAllByTestId('SupervisorAccountIcon');
        expect(adminIcon.length).toBe(4); // 4 admin users in test data
        expect(employeeIcon.length).toBe(6); // 6 employee users in test data
    });
});
