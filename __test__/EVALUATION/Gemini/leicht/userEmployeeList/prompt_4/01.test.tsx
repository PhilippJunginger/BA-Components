import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- promise

- variable - 2

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 3 Redundazen


Best-Practices: -20
CleanCode: -10
Testumfang: 41,75
 */

const generateUsers = (numUsers: number): UserNoPw[] => {
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
    const testUsers: UserNoPw[] = generateUsers(10);

    it('should render the component title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display "no users" message when the user list is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should display a list of users when fetchedUsers is not empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Test User 3');
        expect(screen.getByText('Test User 3')).toBeVisible();
        expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });

    it('should sort users by name ascending by default', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userNames = screen.getAllByText(/Test User/);
        const sortedNames = [...userNames].sort((a, b) => a.textContent!.localeCompare(b.textContent!));
        expect(userNames).toEqual(sortedNames);
    });

    it('should sort users by email when email sort is selected', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userEmails = screen.getAllByText(/@example.com/);
        const sortedEmails = [...userEmails].sort((a, b) => a.textContent!.localeCompare(b.textContent!));
        expect(userEmails).toEqual(sortedEmails);
    });

    it('should remove a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userToDelete = testUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToDelete.name}`);
        await userEvent.click(deleteButton);
        expect(screen.queryByText(userToDelete.name)).not.toBeInTheDocument();
    });

    it('should display the correct icon based on user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const adminIcon = screen.getAllByTestId('BadgeIcon');
        const employeeIcon = screen.getAllByTestId('SupervisorAccountIcon');
        expect(adminIcon.length).toBe(4);
        expect(employeeIcon.length).toBe(6);
    });

    it('should display "no matching users" message when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
