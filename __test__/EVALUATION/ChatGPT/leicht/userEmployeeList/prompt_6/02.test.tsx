import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- vairablen - 5


- 5 von 6 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: 0
CleanCode: -25
Testumfang: 75,15
 */

const fetchedUsers = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    it('should display all users initially', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should display info alert if no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

        await user.click(screen.getByLabelText('Name'));

        const sortedUsers = screen.getAllByRole('listitem');
        expect(sortedUsers[0]).toHaveTextContent('Alice');
        expect(sortedUsers[1]).toHaveTextContent('Bob');
        expect(sortedUsers[2]).toHaveTextContent('Charlie');
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

        await user.click(screen.getByLabelText('Email'));

        const sortedUsers = screen.getAllByRole('listitem');
        expect(sortedUsers[0]).toHaveTextContent('alice@example.com');
        expect(sortedUsers[1]).toHaveTextContent('bob@example.com');
        expect(sortedUsers[2]).toHaveTextContent('charlie@example.com');
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('should display info alert if no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
