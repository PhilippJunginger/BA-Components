import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*


- setup
- doppelung keine Variable - 5
- render FUnktion


- 8 von 10 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: 0
CleanCode: -30
Testumfang: 75
 */

const mockRouter = {
    push: jest.fn(),
};

jest.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

describe('UserEmployeeListMittel', () => {
    const mockUsers: UserNoPw[] = [
        { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
        { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    ];

    const setup = (users = mockUsers) => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        return userEvent.setup();
    };

    it.skip('renders the component with user list', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3);
    });

    it.skip('filters users based on search term', async () => {
        const user = setup();
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'John');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        const user = setup();
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        await user.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Bob Johnson')).toBeInTheDocument();

        await user.click(nameRadio);
        const sortedListItems = screen.getAllByRole('listitem');
        expect(within(sortedListItems[0]).getByText('Bob Johnson')).toBeInTheDocument();
    });

    it.skip('filters users by role', async () => {
        const user = setup();
        const roleSelect = screen.getByLabelText('Filter by Role');

        await user.click(roleSelect);
        await user.click(screen.getByText('ADMIN'));
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Bob Johnson')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        const user = setup();
        const deleteButton = screen.getByLabelText('delete-John Doe');

        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to edit user page', async () => {
        const user = setup();
        const editButton = screen.getByLabelText('edit-John Doe');

        await user.click(editButton);
        expect(mockRouter.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    it.skip('paginates the user list', async () => {
        const manyUsers = Array(12)
            .fill(null)
            .map((_, index) => ({
                name: `User ${index}`,
                email: `user${index}@example.com`,
                role: USER_ROLE.EMPLOYEE,
            }));
        const user = setup(manyUsers);

        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await user.click(nextPageButton);
        expect(screen.getByText('User 5')).toBeInTheDocument();
    });

    it('displays info message when no users match search', async () => {
        const user = setup();
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info message when no users are available', () => {
        setup([]);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
