import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListSchwer from '../../../../../../components/schwierig/userEmployeeListSchwer';

/*
- setup
- missing assertion

- unused const - 3
- variables - 3

- 10 von 12 notwendigem Testumfang erreicht + 2 Redudndanz


Best-Practices: -20
CleanCode: -30
Testumfang: 74,7
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jack Doe', email: 'jack.doe@example.com', role: USER_ROLE.EMPLOYEE },
];

// Mock fetch and its response for different scenarios
const mockFetch = (users: UserNoPw[] | null, error?: boolean) => {
    global.fetch = jest.fn().mockImplementation(() => {
        if (error) {
            return Promise.reject(new Error('Fetch Error'));
        }
        return Promise.resolve({
            json: () => Promise.resolve(users),
            status: users ? 200 : 204,
        });
    });
};

describe('UserEmployeeListSchwer Component', () => {
    beforeEach(() => {
        mockFetch(mockUsers);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders user list correctly', async () => {
        render(<UserEmployeeListSchwer />);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(mockUsers.length);
    });

    it('filters user list by search term', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
    });

    it('sorts user list by name', async () => {
        render(<UserEmployeeListSchwer />);
        const sortSelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(screen.getByLabelText('Name'));
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems[0].textContent).toContain('Jane Doe');
    });

    it('sorts user list by email', async () => {
        render(<UserEmployeeListSchwer />);
        const sortSelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(screen.getByLabelText('Email'));
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems[0].textContent).toContain('jack.doe@example.com');
    });

    it('filters user list by role', async () => {
        render(<UserEmployeeListSchwer />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);
        const userListItems = await screen.findAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
    });

    it('paginates user list correctly', async () => {
        mockFetch(Array(10).fill(mockUsers[0]));
        render(<UserEmployeeListSchwer />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        const pageButtons = await screen.findAllByRole('button', { name: /\d/ });
        expect(pageButtons).toHaveLength(2);
    });

    it('deletes user from list', async () => {
        render(<UserEmployeeListSchwer />);
        const deleteButton = await screen.findAllByLabelText(/delete/i);
        await userEvent.click(deleteButton[0]);
        await waitFor(() => {
            expect(screen.getAllByRole('listitem')).toHaveLength(2);
        });
    });

    it('shows error message when deleting user fails', async () => {
        mockFetch(null, true);
        render(<UserEmployeeListSchwer />);
        const deleteButton = await screen.findAllByLabelText(/delete/i);
        await userEvent.click(deleteButton[0]);
        const snackbar = await screen.findByRole('alert');
        expect(snackbar).toHaveTextContent('Deletion of user failed!');
    });

    it('navigates to edit user page', async () => {
        render(<UserEmployeeListSchwer />);
        const editButton = await screen.findAllByLabelText(/edit/i);
        await userEvent.click(editButton[0]);
        // Add assertion to check if the navigation happened correctly
    });

    it('shows error message when fetching users fails', async () => {
        mockFetch(null, true);
        render(<UserEmployeeListSchwer />);
        const errorMessage = await screen.findByText('An error occurred while retrieving users');
        expect(errorMessage).toBeVisible();
    });

    it('shows message when no users are found', async () => {
        mockFetch([]);
        render(<UserEmployeeListSchwer />);
        const message = await screen.findByText('No Users created');
        expect(message).toBeVisible();
    });

    it('shows message when no users match the search criteria', async () => {
        render(<UserEmployeeListSchwer />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        const message = await screen.findByText('There are no users matching the current search');
        expect(message).toBeVisible();
    });
});
