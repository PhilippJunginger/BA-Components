import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render beforeEach

- setup
- vairablen - 7
- unnecessary waitFor

- 7 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -45
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
    push: mockRouterPush,
});

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    it('should render the component and display user list', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.smith@example.com')).toBeInTheDocument();
    });

    it('should filter users based on search input', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);

        const sortedUsers = screen.getAllByRole('listitem');
        expect(sortedUsers[0]).toHaveTextContent('jane.smith@example.com');
        expect(sortedUsers[1]).toHaveTextContent('john.doe@example.com');
    });

    it('should filter users by role', async () => {
        const filterRole = screen.getByLabelText('Filter by Role');
        await userEvent.click(filterRole);
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should navigate to user edit page on edit button click', async () => {
        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('/edit/John Doe');
        });
    });

    it('should remove a user and show snackbar message', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(await screen.findByText('User removed successfully!')).toBeInTheDocument();
    });

    it.skip('should paginate users', async () => {
        // Adjust the fetchedUsers to test pagination more accurately if needed
        const paginationButtons = screen.getAllByRole('button', { name: /page/i });
        expect(paginationButtons).toHaveLength(2); // assuming two pages based on rowsPerPage

        await userEvent.click(paginationButtons[1]);

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should show alert when no users match the search', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
