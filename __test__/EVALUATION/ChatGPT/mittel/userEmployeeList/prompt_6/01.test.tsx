import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- unused import
- vairablen - 5
- enum

- 6 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -35
Testumfang: 55
 */

const mockPush = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

describe('UserEmployeeListMittel', () => {
    const fetchedUsers: UserNoPw[] = [
        { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
        { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'David', email: 'david@example.com', role: USER_ROLE.ADMIN },
        { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Frank', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
    ];

    it('should render the user list with initial users', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const userList = screen.getByRole('list', { name: /user-list/i });
        const { getAllByRole } = within(userList);
        const items = getAllByRole('listitem');
        expect(items).toHaveLength(5); // Pagination shows first 5 users
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText(/search users/i);
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const emailRadio = screen.getByLabelText(/email/i);
        await userEvent.click(emailRadio);

        const userList = screen.getByRole('list', { name: /user-list/i });
        const { getAllByRole } = within(userList);
        const items = getAllByRole('listitem');

        const firstItemText = within(items[0]).getByText(/alice@example.com/i);
        expect(firstItemText).toBeInTheDocument();
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const roleSelect = screen.getByLabelText(/filter by role/i);
        await userEvent.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: 'EMPLOYEE' });
        await userEvent.click(employeeOption);

        const userList = screen.getByRole('list', { name: /user-list/i });
        const { getAllByRole } = within(userList);
        const items = getAllByRole('listitem');

        expect(items).toHaveLength(4); // 4 employees
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('should paginate users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        const userList = screen.getByRole('list', { name: /user-list/i });
        const { getAllByRole } = within(userList);
        const items = getAllByRole('listitem');

        expect(items).toHaveLength(1); // Last user on the second page
        expect(screen.getByText('Frank')).toBeInTheDocument();
    });

    it('should display a snackbar message when a user is removed', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        const snackbar = await screen.findByRole('alert');
        expect(snackbar).toHaveTextContent('User removed successfully!');
    });

    it('should route to user page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);

        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });
});
