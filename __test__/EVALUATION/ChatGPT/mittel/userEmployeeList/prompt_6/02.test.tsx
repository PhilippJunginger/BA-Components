import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*

- setup
- unused import
- vairablen - 9

- 7 von 10 notwendigen Testfälen erreicht + 1 A + 1 Redundanz


Best-Practices: 0
CleanCode: -55
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;

const fetchedUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
    // Add more mock users as needed
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        mockedUseRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it.skip('should display the correct initial state', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        expect(screen.getByRole('textbox', { name: 'Search Users' })).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await user.type(searchInput, 'Jane');

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const sortByName = screen.getByLabelText('Name');
        await user.click(sortByName);

        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Jane Smith');
        expect(userList[1]).toHaveTextContent('John Doe');
    });

    it.skip('should sort users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const sortByEmail = screen.getByLabelText('Email');
        await user.click(sortByEmail);

        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('john@example.com');
        expect(userList[1]).toHaveTextContent('jane@example.com');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const filterRoleSelect = screen.getByLabelText('Filter by Role');
        await user.click(filterRoleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it.skip('should display pagination and navigate through pages', async () => {
        const usersWithMoreEntries = [
            ...fetchedUsers,
            { name: 'User Three', email: 'three@example.com', role: USER_ROLE.EMPLOYEE },
            { name: 'User Four', email: 'four@example.com', role: USER_ROLE.ADMIN },
            { name: 'User Five', email: 'five@example.com', role: USER_ROLE.EMPLOYEE },
            { name: 'User Six', email: 'six@example.com', role: USER_ROLE.ADMIN },
        ];
        render(<UserEmployeeListMittel fetchedUsers={usersWithMoreEntries} />);
        const user = userEvent.setup();

        expect(screen.getByText('User Three')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Go to page 2' }));
        expect(screen.getByText('User Six')).toBeInTheDocument();
        expect(screen.queryByText('User Three')).not.toBeInTheDocument();
    });

    it('should handle edit user button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();
        const router = useRouter();

        const editButton = screen.getByLabelText('edit-John Doe');
        await user.click(editButton);

        expect(router.push).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('should handle delete user button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should display a snackbar with a message', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });
});
