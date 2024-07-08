import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- missing assertions - 2

- vairablen
- overly complicated tests with loops - 3
- weird way to generate mock users


- 7 von 10 notwendigen Testfälen erreicht + 1 A + 2 Redundanz


Best-Practices: -30
CleanCode: -25
Tetumfang: 60
 */

const generateUser = (index: number, role: USER_ROLE = USER_ROLE.EMPLOYEE): UserNoPw => ({
    name: `User ${index}`,
    email: `user${index}@example.com`,
    role,
});

const testUsers: UserNoPw[] = [
    generateUser(1),
    generateUser(2, USER_ROLE.ADMIN),
    generateUser(3),
    generateUser(4),
    generateUser(5, USER_ROLE.ADMIN),
    generateUser(6),
    generateUser(7),
    generateUser(8),
    generateUser(9),
    generateUser(10),
];

describe('UserEmployeeListMittel Component', () => {
    it('renders without crashing', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
    });

    it('renders user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);

        testUsers.slice(0, 5).forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'User 3');
        expect(screen.getByText('User 3')).toBeVisible();
        testUsers
            .filter((user) => user.name !== 'User 3')
            .forEach((user) => {
                expect(screen.queryByText(user.name)).not.toBeVisible();
            });
    });

    it('filters users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'user4@example.com');
        expect(screen.getByText('User 4')).toBeVisible();
        testUsers
            .filter((user) => user.email !== 'user4@example.com')
            .forEach((user) => {
                expect(screen.queryByText(user.name)).not.toBeVisible();
            });
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(within(sortBySelect).getByLabelText('Name'));
        const userNames = screen.getAllByText(/User \d+/).map((item) => item.textContent);
        expect(userNames).toEqual(userNames.slice().sort());
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(within(sortBySelect).getByLabelText('Email'));
        const userEmails = screen.getAllByText(/user\d+@example.com/).map((item) => item.textContent);
        expect(userEmails).toEqual(userEmails.slice().sort());
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        testUsers
            .filter((user) => user.role === USER_ROLE.ADMIN)
            .forEach((user) => {
                expect(screen.getByText(user.name)).toBeVisible();
            });
        testUsers
            .filter((user) => user.role !== USER_ROLE.ADMIN)
            .forEach((user) => {
                expect(screen.queryByText(user.name)).not.toBeVisible();
            });
    });

    it('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        expect(screen.getAllByRole('listitem').length).toBe(5);
        const pagination = screen.getByRole('navigation');
        await userEvent.click(within(pagination).getByText('2'));
        expect(screen.getAllByRole('listitem').length).toBe(5);
    });

    it('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const userToRemove = testUsers[0];
        const deleteButton = screen.getByRole('button', { name: `delete-${userToRemove.name}` });
        await userEvent.click(deleteButton);
        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
    });

    it('shows snackbar message on user removal', async () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const userToRemove = testUsers[0];
        const deleteButton = screen.getByRole('button', { name: `delete-${userToRemove.name}` });
        await userEvent.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });
});
