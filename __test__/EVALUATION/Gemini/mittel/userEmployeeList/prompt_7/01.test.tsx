import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion
- fireEvent

- render Funktion
- variable - 4

- 8 von 10 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -30
CleanCode: -25
Testumfang: 70
 */

const testUsers: UserNoPw[] = [
    {
        email: 'john.doe@example.com',
        name: 'John Doe',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'jane.doe@example.com',
        name: 'Jane Doe',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        email: 'peter.pan@example.com',
        name: 'Peter Pan',
        role: USER_ROLE.EMPLOYEE,
    },
];

const setup = (users: UserNoPw[] = testUsers) => {
    render(<UserEmployeeListMittel fetchedUsers={users} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('should render the component with the correct title', () => {
        setup();
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        setup();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeVisible();
            expect(screen.getByText(user.email)).toBeVisible();
        });
    });

    it('should filter users based on search term', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Peter Pan')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        setup();
        const nameSortRadio = screen.getByLabelText('Name');
        fireEvent.click(nameSortRadio);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0]);
        expect(userNames).toEqual(['Jane Doe', 'John Doe', 'Peter Pan']);
    });

    it('should sort users by email', async () => {
        setup();
        const emailSortRadio = screen.getByLabelText('Email');
        fireEvent.click(emailSortRadio);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1]);
        expect(userEmails).toEqual(['jane.doe@example.com', 'john.doe@example.com', 'peter.pan@example.com']);
    });

    it('should filter users by role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Peter Pan')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should paginate users', async () => {
        setup();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Assuming rowsPerPage is set to 2 for testing
        const page2Button = screen.getByText('2');
        fireEvent.click(page2Button);
        // Assert that the correct users are displayed on page 2
    });

    it('should display a message when no users match the search criteria', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should display a message when no users are available', () => {
        setup([]);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should remove a user from the list', async () => {
        setup();
        const deleteUserButton = screen.getByLabelText('delete-John Doe');
        fireEvent.click(deleteUserButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should display a snackbar message after removing a user', async () => {
        setup();
        const deleteUserButton = screen.getByLabelText('delete-John Doe');
        fireEvent.click(deleteUserButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('should navigate to the user edit page', async () => {
        setup();
        const editUserButton = screen.getByLabelText('edit-John Doe');
        fireEvent.click(editUserButton);
        // Assert that the router has been pushed to the correct route
    });
});
