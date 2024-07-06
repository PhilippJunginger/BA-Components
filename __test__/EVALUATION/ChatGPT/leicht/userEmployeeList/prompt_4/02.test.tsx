import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*


- vairablen - 3
- unused import

- 5 von 6 notwendigen Testfälen erreicht + 2 Redundanzen


Best-Practices: 0
CleanCode: -20
Testumfang: 66,8
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    it.skip('should render the component with initial props', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('should display info alert when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should display info alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        await user.click(emailRadio);
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();

        await user.click(nameRadio);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('should display the correct icon for each user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByTestId('BadgeIcon')).toBeInTheDocument();
        expect(screen.getByTestId('SupervisorAccountIcon')).toBeInTheDocument();
    });
});
