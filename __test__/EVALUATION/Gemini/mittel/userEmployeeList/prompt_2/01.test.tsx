import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion
- fireEvent

- variable - 3
- unused const

- 6 von 10 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 50
 */

const generateMockUsers = (numUsers: number): UserNoPw[] => {
    const users: UserNoPw[] = [];
    for (let i = 0; i < numUsers; i++) {
        const userRole = i % 2 === 0 ? USER_ROLE.ADMIN : i % 3 === 0 ? USER_ROLE.EMPLOYEE : USER_ROLE.CUSTOMER;
        users.push({
            email: `test${i}@example.com`,
            name: `Test User ${i}`,
            role: userRole,
        });
    }
    return users;
};

const testUsers: UserNoPw[] = generateMockUsers(10);

describe('UserEmployeeListMittel Component', () => {
    it('renders without crashing', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
    });

    it('renders the correct number of user items', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(5); // Should only show the first page (5 users)
    });

    it('correctly filters users based on search term', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'test1@example.com' } });
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(1);
    });

    it('correctly filters users based on role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const selectInput = screen.getByRole('combobox', { name: /Filter by Role/i });
        await userEvent.selectOptions(selectInput, USER_ROLE.ADMIN);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(5); // Half the test users are admins
    });

    it('correctly sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortInput = screen.getByRole('radiogroup', { name: /Sort by/i });
        await userEvent.click(screen.getByLabelText('Name'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0].textContent).toContain('Test User 0'); // Should be first after sorting by name
    });

    it('correctly sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortInput = screen.getByRole('radiogroup', { name: /Sort by/i });
        await userEvent.click(screen.getByLabelText('Email'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0].textContent).toContain('test0@example.com'); // Should be first after sorting by email
    });

    it('correctly paginates user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const pagination = screen.getByRole('navigation');
        const page2Button = screen.getByText('2');
        fireEvent.click(page2Button);
        expect(pagination).toHaveAttribute('aria-current', '2');
    });

    it('displays the correct icon based on user role', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const adminIcon = screen.getByTitle('Badge');
        const employeeIcon = screen.getByTitle('Supervisor Account');
        expect(adminIcon).toBeInTheDocument();
        expect(employeeIcon).toBeInTheDocument();
    });

    it('removes a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteUserButton);
        // Check if the user is removed from the DOM
        expect(screen.queryByText(testUsers[0].email)).not.toBeInTheDocument();
    });

    it('displays a snackbar message when a user is removed', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteUserButton);
        const snackbar = screen.getByRole('alertdialog');
        expect(snackbar).toBeVisible();
        expect(snackbar).toHaveTextContent('User removed successfully!');
    });
});
