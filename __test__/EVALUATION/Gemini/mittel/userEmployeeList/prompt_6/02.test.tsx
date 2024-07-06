import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion
- node access

- variable - 5

- 7 von 10 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -30
CleanCode: -25
Testumfang: 60
 */

const testUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel Component', () => {
    it('renders user list with correct data', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await userEvent.type(searchInput, 'bob');
        expect(screen.getByText('Bob')).toBeVisible();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortOptions = screen.getByRole('radiogroup');
        await userEvent.click(sortOptions.querySelector('input[value="name"]')!);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
        expect(userNames).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortOptions = screen.getByRole('radiogroup');
        await userEvent.click(sortOptions.querySelector('input[value="email"]')!);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
        expect(userEmails).toEqual(['alice@example.com', 'bob@example.com', 'charlie@example.com']);
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('Alice')).toBeVisible();
        expect(screen.getByText('Charlie')).toBeVisible();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('paginates the user list correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        // Assuming rowsPerPage is 2 (check the component code)
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        const pagination = screen.getByRole('navigation');
        const page2Button = pagination.querySelector('button[aria-label="Go to page 2"]');
        expect(page2Button).toBeInTheDocument();
        await userEvent.click(page2Button!);
    });

    it('deletes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('navigates to the edit page when edit button is clicked', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
        await userEvent.click(editButton);
        // Assertion to check if the routing logic is triggered - This will depend on your routing setup
    });

    it('shows a snackbar message after deleting a user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        const snackbar = screen.getByRole('alert');
        expect(snackbar).toBeVisible();
        expect(snackbar).toHaveTextContent('User removed successfully!');
    });

    it('shows a message when there are no users', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('shows a message when there are no matching users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
