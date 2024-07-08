import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render in beforeEach

- unused import
- vairablen - 5

- 7 von 10 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: -10
CleanCode: -30
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    it.skip('should display the correct initial state', () => {
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toHaveValue('');
        expect(screen.getByLabelText('Name')).toBeChecked();
        expect(screen.getByLabelText('Filter by Role')).toHaveValue('all');
    });

    it('should filter users based on search input', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);
        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('jane@example.com');
        expect(userList[1]).toHaveTextContent('john@example.com');
    });

    it('should filter users by role', async () => {
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.EMPLOYEE }));
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });

    it.skip('should paginate users', async () => {
        const pagination = screen.getByRole('button', { name: '2' });
        await user.click(pagination);
        expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'true');
    });

    it('should remove a user from the list', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page', async () => {
        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Jane Smith');
    });

    it('should display no users available message', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should display no users matching search message', async () => {
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
