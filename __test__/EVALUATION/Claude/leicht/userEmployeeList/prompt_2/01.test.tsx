import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- doppelung keine Variable - 4


- 5 von 6 notwendigem Testumfang erreicht + 1 Redundant


Best-Practices: 0
CleanCode: -20
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    const user = userEvent.setup();

    it('renders the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument(); // Customer should not be shown
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

        await user.clear(searchInput);
        await user.type(searchInput, 'jane@example.com');
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it.skip('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Default sort is by name
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('John Doe')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('Jane Smith')).toBeInTheDocument();

        // Sort by email
        await user.click(emailRadio);
        const listItemsAfterEmailSort = screen.getAllByRole('listitem');
        expect(within(listItemsAfterEmailSort[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItemsAfterEmailSort[1]).getByText('John Doe')).toBeInTheDocument();

        // Sort back by name
        await user.click(nameRadio);
        const listItemsAfterNameSort = screen.getAllByRole('listitem');
        expect(within(listItemsAfterNameSort[0]).getByText('John Doe')).toBeInTheDocument();
        expect(within(listItemsAfterNameSort[1]).getByText('Jane Smith')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteJohnButton = screen.getByLabelText('delete-John Doe');

        await user.click(deleteJohnButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays correct icon for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminIcon = screen.getByTestId('BadgeIcon');
        const employeeIcon = screen.getByTestId('SupervisorAccountIcon');

        expect(adminIcon).toBeInTheDocument();
        expect(employeeIcon).toBeInTheDocument();
    });

    it('displays info message when no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
