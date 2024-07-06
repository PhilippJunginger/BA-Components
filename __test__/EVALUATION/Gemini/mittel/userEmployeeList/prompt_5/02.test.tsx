import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- fireEvent
- setup
- no assertion

- variable -6
- setup funktion

- 6 von 10 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -30
CleanCode: -35
Testumfang: 50
 */

const testUsers: UserNoPw[] = [
    { email: 'test.user@test.com', name: 'Test User', role: USER_ROLE.EMPLOYEE },
    { email: 'admin.user@test.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'jane.doe@test.com', name: 'Jane Doe', role: USER_ROLE.EMPLOYEE },
];

const setup = (users: UserNoPw[] = testUsers) => render(<UserEmployeeListMittel fetchedUsers={users} />);

describe('UserEmployeeListMittel Component', () => {
    it('should render the component', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        setup();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        setup();
        const nameSortRadio = screen.getByLabelText('Name');
        fireEvent.click(nameSortRadio);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0]);
        expect(userNames).toEqual(['Admin User', 'Jane Doe', 'Test User']);
    });

    it('should sort users by email', async () => {
        setup();
        const emailSortRadio = screen.getByLabelText('Email');
        fireEvent.click(emailSortRadio);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1]);
        expect(userEmails).toEqual(['admin.user@test.com', 'jane.doe@test.com', 'test.user@test.com']);
    });

    it('should filter users by role', async () => {
        setup();
        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('Admin User')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should display a message when no users match the search', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should handle user deletion', async () => {
        setup();
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteUserButton);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('should paginate the user list', () => {
        setup([...testUsers, ...testUsers, ...testUsers]); // Create enough users to require pagination
        expect(screen.getByText('Test User')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
        const nextPageButton = screen.getByRole('button', { name: 'Go to next page' });
        fireEvent.click(nextPageButton);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeVisible();
    });

    it('should navigate to the user edit page', async () => {
        setup();
        const editUserButton = screen.getAllByLabelText(/edit/i)[0];
        fireEvent.click(editUserButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
