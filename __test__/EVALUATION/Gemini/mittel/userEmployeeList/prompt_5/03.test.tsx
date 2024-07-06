import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- fireEvent
- setup
- interface
- no assertion

- variable -6
- setup funktion

- 6 von 10 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -40
CleanCode: -35
Testumfang: 50
 */

const testUsers: UserNoPw[] = [
    { email: 'test.user@test.com', name: 'Test User', role: USER_ROLE.EMPLOYEE },
    { email: 'admin.user@test.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'another.user@test.com', name: 'Another User', role: USER_ROLE.EMPLOYEE },
];

const setup = (props: any = { fetchedUsers: testUsers }) => {
    render(<UserEmployeeListMittel {...props} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with the correct title', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('renders the correct number of user list items', () => {
        setup();
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBe(testUsers.length);
    });

    it('filters users by search term', () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Admin' } });
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBe(1);
        expect(listItems[0]).toHaveTextContent('Admin User');
    });

    it('sorts users by name', () => {
        setup();
        const sortBySelect = screen.getByRole('radiogroup');
        fireEvent.click(sortBySelect);
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Admin User');
        expect(listItems[1]).toHaveTextContent('Another User');
        expect(listItems[2]).toHaveTextContent('Test User');
    });

    it('sorts users by email', () => {
        setup();
        const sortBySelect = screen.getByRole('radiogroup');
        fireEvent.click(sortBySelect);
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('admin.user@test.com');
        expect(listItems[1]).toHaveTextContent('another.user@test.com');
        expect(listItems[2]).toHaveTextContent('test.user@test.com');
    });

    it('filters users by role', () => {
        setup();
        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.mouseDown(roleSelect);
        const employeeOption = screen.getByText('EMPLOYEE');
        fireEvent.click(employeeOption);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBe(2);
        expect(listItems[0]).toHaveTextContent('Test User');
        expect(listItems[1]).toHaveTextContent('Another User');
    });

    it('paginates users correctly', () => {
        setup();
        const pagination = screen.getByRole('pagination');
        // Assuming rowsPerPage is 5
        expect(pagination).toHaveTextContent('1');
        // Add more users to trigger pagination
        const newUsers = [...testUsers, ...testUsers, ...testUsers];
        setup({ fetchedUsers: newUsers });
        expect(pagination).toHaveTextContent('2');
        const nextPageButton = screen.getByText('2');
        fireEvent.click(nextPageButton);
        // Assert that users from the second page are displayed
    });

    it('removes a user from the list', async () => {
        setup();
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteUserButton);
        // Assuming handleRemoveUserFromList updates the list correctly
        const listItems = screen.getAllByRole('listitem');
        expect(listItems.length).toBe(testUsers.length - 1);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('displays a snackbar message after removing a user', async () => {
        setup();
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteUserButton);
        const snackbar = await screen.findByRole('alertdialog');
        expect(snackbar).toHaveTextContent('User removed successfully!');
    });

    it('navigates to the edit user page', async () => {
        setup();
        const editUserButton = screen.getAllByLabelText(/edit/i)[0];
        await userEvent.click(editUserButton);
        // Assertions for routing logic
    });
});
