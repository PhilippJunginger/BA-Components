import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*


- unused import - 2
- vairablen - 7
- typeerror

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -50
Testumfang: 75
 */

// Mocking the next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const fetchedUsers = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();
    const pushMock = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
    });

    it('should render the component with initial users', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        await user.click(screen.getByLabelText('Email'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice');
        expect(userItems[1]).toHaveTextContent('Bob');
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByText(USER_ROLE.EMPLOYEE));
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it.skip('should handle page changes', async () => {
        const manyUsers = [...Array(10).keys()].map((i) => ({
            name: `User${i}`,
            email: `user${i}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);
        const pagination = screen.getByRole('button', { name: '2' });
        await user.click(pagination);
        expect(screen.getByText('User5')).toBeInTheDocument();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        await user.click(screen.getByLabelText(`delete-Alice`));
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        await user.click(screen.getByLabelText('edit-Alice'));
        expect(pushMock).toHaveBeenCalledWith('/edit/Alice');
    });

    it('should show no users available alert', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should show no matching users alert', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
