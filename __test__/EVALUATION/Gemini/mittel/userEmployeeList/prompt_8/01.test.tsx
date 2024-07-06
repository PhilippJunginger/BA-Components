import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- node access
- no assertion

- typeerror
- variable - 6

- 7 von 10 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -30
CleanCode: -35
Testumfang: 60
 */

const testUsers: UserNoPw[] = [
    { email: 'test@test.com', name: 'John Doe', role: USER_ROLE.ADMIN },
    { email: 'jane@example.com', name: 'Jane Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'peter@test.com', name: 'Peter Pan', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    it('should render the component', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(screen.getByLabelText('Name', { selector: 'input' }));
        // Check if the order is correct
        const userNames = screen.getAllByText(/^[A-Z][a-z]+ [A-Z][a-z]+$/); // Assuming names are in "Name Surname" format
        expect(userNames.map((el) => el.textContent)).toEqual(['Jane Doe', 'John Doe', 'Peter Pan']);
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        await userEvent.click(screen.getByLabelText('Email', { selector: 'input' }));
        // Check if the order is correct
        const emails = screen.getAllByText(/^[a-z]+@[a-z]+\.[a-z]+$/);
        expect(emails.map((el) => el.textContent)).toEqual(['jane@example.com', 'peter@test.com', 'test@test.com']);
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Peter Pan')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should paginate the user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        // Assuming rowsPerPage is set to a value less than testUsers.length
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('Peter Pan')).not.toBeInTheDocument();

        const pagination = screen.getByRole('navigation');
        const nextPageButton = pagination.querySelector('button[aria-label="Go to next page"]');
        if (nextPageButton) {
            await userEvent.click(nextPageButton);
            expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Peter Pan')).toBeVisible();
        } else {
            throw new Error('Could not find the next page button');
        }
    });

    it('should display a message when no users match the search criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should display a message when there are no users available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should navigate to the edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const editButton = screen.getAllByRole('button', { name: /edit/i })[0];
        await userEvent.click(editButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
