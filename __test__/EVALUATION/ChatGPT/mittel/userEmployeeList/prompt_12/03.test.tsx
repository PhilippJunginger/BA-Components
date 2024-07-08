import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render in beforeEach

- unused import
- vairablen - 4

- 5 von 10 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: -10
CleanCode: -25
Testumfang: 45
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    it.skip('should display the correct number of users', () => {
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(fetchedUsers.length);
    });

    it.skip('should filter users based on search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('jane@example.com');
    });

    it.skip('should filter users by role', async () => {
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems).toHaveLength(1);
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('should paginate users', async () => {
        const pagination = screen.getByRole('navigation');
        await user.click(screen.getByRole('button', { name: '2' }));
        expect(screen.getByRole('list')).toBeEmptyDOMElement();
    });

    it('should display snackbar on user removal', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page', async () => {
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Jane Smith');
    });
});
