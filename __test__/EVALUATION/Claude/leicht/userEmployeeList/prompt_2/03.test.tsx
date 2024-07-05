import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- doppelung keine Variable - 7


- 5 von 6 notwendigem Testumfang erreicht + 4 Redundant


Best-Practices: 0
CleanCode: -35
Testumfang: 42,9
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
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');

        await user.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('John Doe')).toBeInTheDocument();
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const emailRadio = screen.getByLabelText('Email');

        await user.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('John Doe')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');

        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays correct icon for admin user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminListItem = screen.getByLabelText('John Doe');
        expect(within(adminListItem).getByTestId('BadgeIcon')).toBeInTheDocument();
    });

    it('displays correct icon for employee user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const employeeListItem = screen.getByLabelText('Jane Smith');
        expect(within(employeeListItem).getByTestId('SupervisorAccountIcon')).toBeInTheDocument();
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
