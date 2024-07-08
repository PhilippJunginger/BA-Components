import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- node access
- redundant await
- fireEvent

- vairablen - 4
- enum


- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -25
Tetumfang: 75
 */

const testUsers: UserNoPw[] = [
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'John Smith', email: 'john.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Williams', email: 'bob.williams@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eva Brown', email: 'eva.brown@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie Green', email: 'charlie.green@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel Component', () => {
    it('should render the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeVisible();
            expect(screen.getByText(user.email)).toBeVisible();
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup');

        // Sort by name
        await fireEvent.click(sortBySelect.querySelector('input[value="name"]')!);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('Alice Johnson');

        // Sort by email
        await fireEvent.click(sortBySelect.querySelector('input[value="email"]')!);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('alice.johnson@example.com');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await fireEvent.mouseDown(roleSelect);
        const employeeOption = screen.getByText('EMPLOYEE');
        await fireEvent.click(employeeOption);
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('should paginate user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        expect(screen.getAllByRole('listitem').length).toBe(5);
        const pagination = screen.getByRole('pagination');
        const nextPageButton = pagination.querySelector('.MuiPaginationItem-next')!;
        await fireEvent.click(nextPageButton);
        expect(screen.getAllByRole('listitem').length).toBe(1);
    });

    it('should delete a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteUserButton = screen.getAllByLabelText('delete')[0];
        await fireEvent.click(deleteUserButton);
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('should navigate to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const editUserButton = screen.getAllByLabelText('edit')[0];
        await fireEvent.click(editUserButton);
        // Add assertion to check if the router.push function was called with the correct path
    });

    it('should display a message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when no users match the search criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
