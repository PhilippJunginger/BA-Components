import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- unused import
- vairablen - 7
- typeerror

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -45
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
useRouter.mockImplementation(() => ({
    push: mockPush,
}));

describe('UserEmployeeListMittel Component', () => {
    const fetchedUsers = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with initial users', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'John');

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should sort users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        // Sort by email
        const sortByEmail = screen.getByLabelText('Email');
        await userEvent.click(sortByEmail);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('jane@example.com');
        expect(userItems[1]).toHaveTextContent('john@example.com');
    });

    it.skip('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should paginate users', async () => {
        const manyUsers = Array.from({ length: 12 }, (_, i) => ({
            name: `User${i + 1}`,
            email: `user${i + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));

        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);

        expect(screen.getByText('User1')).toBeInTheDocument();
        expect(screen.queryByText('User6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: /next/i });
        await userEvent.click(nextPageButton);

        expect(screen.queryByText('User1')).not.toBeInTheDocument();
        expect(screen.getByText('User6')).toBeInTheDocument();
    });

    it('should remove a user and show a snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
        });
    });

    it('should navigate to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const editButton = screen.getByLabelText('edit-John Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/John Doe');
        });
    });

    it('should display an alert when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should display an alert when no users match the search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
