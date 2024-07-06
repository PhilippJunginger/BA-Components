import { render, screen, fireEvent, within } from '@testing-library/react';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';

/*
- setup
- fireEvent
- conditional assertion

- variable -5

- 7 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -30
CleanCode: -25
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        name: 'John Smith',
        email: 'john.smith@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        role: USER_ROLE.ADMIN,
    },
];

describe('UserEmployeeListMittel Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });
    it('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('renders "no users" message when the user list is empty', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it.skip('filters users by search term', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'john' } });
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    it.skip('sorts users by name', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        const nameOption = within(sortBySelect).getByLabelText('Name');
        fireEvent.click(nameOption);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice Johnson'); // Sorted alphabetically
        expect(userItems[1]).toHaveTextContent('Jane Doe');
        expect(userItems[2]).toHaveTextContent('John Smith');
    });

    it.skip('sorts users by email', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        const emailOption = within(sortBySelect).getByLabelText('Email');
        fireEvent.click(emailOption);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('alice.johnson@example.com'); // Sorted alphabetically
        expect(userItems[1]).toHaveTextContent('jane.doe@example.com');
        expect(userItems[2]).toHaveTextContent('john.smith@example.com');
    });

    it('filters users by role', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        fireEvent.mouseDown(filterSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        fireEvent.click(employeeOption);
        expect(screen.getByText('John Smith')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    it.skip('paginates users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        // Should show a maximum of 5 users per page
        expect(screen.getAllByRole('listitem').length).toBeLessThanOrEqual(5);

        // Check if pagination controls are visible if more than 5 users
        const pageButtons = screen.queryAllByRole('button', { name: /Go to page/ });
        if (mockUsers.length > 5) {
            expect(pageButtons.length).toBeGreaterThan(1); // At least 2 pages
        }
    });

    it.skip('removes a user from the list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteUserButton = screen.getAllByLabelText('delete')[0];
        fireEvent.click(deleteUserButton);
        expect(screen.queryByText(mockUsers[0].email)).not.toBeInTheDocument();
        // Check for snackbar message
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it.skip('navigates to the edit user page', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editUserButton = screen.getAllByLabelText('edit')[0];
        await userEvent.click(editUserButton);
        expect(pushMock).toHaveBeenCalledWith('/edit/Jane Doe'); // Assuming the first button is for Jane Doe
    });

    it('shows "no users matching" when no users match filter and search', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
