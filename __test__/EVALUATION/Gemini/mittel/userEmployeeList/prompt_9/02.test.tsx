import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- fireEvent
- node access

- typeerror
- vairablen - 6

- 6 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -35
Tetumfang: 55
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListMittel', () => {
    const fetchedUsers = [
        { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Peter Jones', email: 'peter.jones@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Mary Brown', email: 'mary.brown@example.com', role: USER_ROLE.ADMIN },
        { name: 'David Lee', email: 'david.lee@example.com', role: USER_ROLE.EMPLOYEE },
    ];
    const mockRouter = {
        push: jest.fn(), // Mock the router's push function
    };
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        // Assert all users are rendered initially
        fetchedUsers.forEach((user) => {
            const listItem = screen.getByText(user.name).closest('li');
            expect(listItem).toBeInTheDocument();
            expect(within(listItem).getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters the user list by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');

        // Assert only John Doe is displayed
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('filters the user list by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const filterSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(filterSelect, { target: { value: USER_ROLE.ADMIN } });

        // Assert only admins are displayed
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('sorts the user list by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const sortByRadios = screen.getAllByRole('radio');
        fireEvent.click(sortByRadios[1]); // Sort by email

        // Assert the order of the users
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('John Doe')).toBeInTheDocument(); // john.doe@example.com
        expect(within(listItems[4]).getByText('Peter Jones')).toBeInTheDocument(); // peter.jones@example.com
    });

    it.skip('paginates the user list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        // Go to page 2
        const nextPageButton = screen.getByLabelText('Go to next page');
        fireEvent.click(nextPageButton);

        // Assert only the last user is shown
        expect(screen.getByText('David Lee')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it.skip('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const firstDeleteButton = screen.getAllByLabelText(/delete-/i)[0];
        fireEvent.click(firstDeleteButton);

        // Assert the user is removed and the snackbar is shown
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it.skip('redirects to the user edit page when the edit button is clicked', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const firstEditButton = screen.getAllByLabelText(/edit-/i)[0];
        fireEvent.click(firstEditButton);

        expect(mockRouter.push).toHaveBeenCalledWith('/edit/John Doe');
    });
});
