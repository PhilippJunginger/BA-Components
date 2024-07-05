import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*

- unused imports - 2
- doppelung keine Variable - 6


- 8 von 10 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: 0
CleanCode: -40
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel', () => {
    const user = userEvent.setup();

    it('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'John');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortByNameRadio = screen.getByLabelText('Name');
        await user.click(sortByNameRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Bob Johnson');
        expect(userItems[1]).toHaveTextContent('Jane Smith');
        expect(userItems[2]).toHaveTextContent('John Doe');
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.selectOptions(roleSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    it.skip('paginates the user list', async () => {
        const manyUsers = Array(15)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index}`,
                email: `user${index}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);
        expect(screen.getByText('User 0')).toBeInTheDocument();
        expect(screen.queryByText('User 5')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);

        expect(screen.queryByText('User 0')).not.toBeInTheDocument();
        expect(screen.getByText('User 5')).toBeInTheDocument();
    });

    it('displays info message when no users match search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
