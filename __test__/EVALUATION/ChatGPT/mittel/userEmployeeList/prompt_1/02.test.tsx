import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- fireEvent
- promises
- setup

- unused import
- vairablen - 5

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 75
 */

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedRouter = useRouter as jest.Mock;

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    // Add more mock users as needed
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        mockedRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it.skip('renders the component with initial props', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('filters users based on search input', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');

        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);

        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('Alice');
        expect(userListItems[1]).toHaveTextContent('Bob');
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const filterRoleSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(filterRoleSelect, USER_ROLE.ADMIN);

        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
    });

    it('removes a user from the list and shows snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument();
        });

        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockedRouter().push).toHaveBeenCalledWith('/edit/Alice');
        });
    });

    it.skip('handles pagination correctly', async () => {
        const moreMockUsers = Array.from({ length: 12 }, (_, i) => ({
            name: `User${i}`,
            email: `user${i}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={moreMockUsers} />);

        const pagination = screen.getByRole('navigation');
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // First page

        await userEvent.click(screen.getByText('2'));
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // Second page

        await userEvent.click(screen.getByText('3'));
        expect(screen.getAllByRole('listitem')).toHaveLength(2); // Third page
    });

    it('shows appropriate message when no users match the search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('shows appropriate message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
