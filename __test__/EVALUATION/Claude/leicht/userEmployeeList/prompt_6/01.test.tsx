import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- doppelung keine Variable - 3


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: 0
CleanCode: -15
Testumfang: 66,8
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    const user = userEvent.setup();

    it('renders the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3); // Excludes CUSTOMER
    });

    it.skip('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'john');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        await user.clear(searchInput);
        await user.type(searchInput, 'SMITH');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Default sort is by name
        let listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('John Doe')).toBeInTheDocument();

        // Sort by email
        await user.click(screen.getByLabelText('Email'));
        listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('John Doe')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getAllByRole('listitem')).toHaveLength(3);
        await user.click(screen.getByLabelText('delete-John Doe'));
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('displays correct icon for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByTestId('BadgeIcon')).toBeInTheDocument();
        expect(screen.getAllByTestId('SupervisorAccountIcon')).toHaveLength(2);
    });

    it('shows info alert when no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('shows info alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
