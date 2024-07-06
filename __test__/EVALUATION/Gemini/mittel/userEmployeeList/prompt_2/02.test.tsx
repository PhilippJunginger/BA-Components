import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion
- fireEvent

- variable - 3
- setup funktion

- 8 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 75
 */

const TEST_USERS: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    {
        name: 'Peter Pan',
        email: 'peter.pan@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
];

const setup = (users: UserNoPw[] = TEST_USERS) => {
    render(<UserEmployeeListMittel fetchedUsers={users} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('should render the component', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        setup();
        TEST_USERS.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Peter Pan')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        setup();
        const sortSelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(sortSelect);
        const nameOption = screen.getByLabelText('Name');

        fireEvent.click(nameOption);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0].trim());
        expect(userNames).toEqual(TEST_USERS.map((user) => user.name).sort());
    });

    it('should sort users by email', async () => {
        setup();
        const sortSelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        const emailOption = screen.getByLabelText('Email');

        fireEvent.click(emailOption);
        const emails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1].trim());
        expect(emails).toEqual(TEST_USERS.map((user) => user.email).sort());
    });

    it('should filter users by role', async () => {
        setup();
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should handle removing a user from the list', async () => {
        setup();
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteUserButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should display a message when no users match the search', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should display a message when there are no users available', () => {
        setup([]);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should paginate the user list', async () => {
        setup([
            ...TEST_USERS,
            { name: 'User 1', email: 'user1@example.com', role: USER_ROLE.ADMIN },
            { name: 'User 2', email: 'user2@example.com', role: USER_ROLE.ADMIN },
            { name: 'User 3', email: 'user3@example.com', role: USER_ROLE.ADMIN },
        ]);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeVisible();
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        const nextPageButton = screen.getByLabelText('Go to next page');
        fireEvent.click(nextPageButton);
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('should navigate to the edit user page', async () => {
        setup();
        const editUserButton = screen.getAllByLabelText(/edit/i)[0];
        fireEvent.click(editUserButton);
        // Add assertion to check if the router has pushed the correct route
    });
});
