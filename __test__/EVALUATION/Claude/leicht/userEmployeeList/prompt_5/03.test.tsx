import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
-setup


- doppelung keine Variable - 4


- 6 von 6 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -25
Testumfang: 83,5
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    it('renders the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(3); // Excluding CUSTOMER
    });

    it.skip('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it.skip('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Default sort by name
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('John Doe')).toBeInTheDocument();

        // Sort by email
        await userEvent.click(emailRadio);
        const listItemsSortedByEmail = screen.getAllByRole('listitem');
        expect(within(listItemsSortedByEmail[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItemsSortedByEmail[1]).getByText('Jane Smith')).toBeInTheDocument();

        // Sort back by name
        await userEvent.click(nameRadio);
        const listItemsSortedByName = screen.getAllByRole('listitem');
        expect(within(listItemsSortedByName[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItemsSortedByName[1]).getByText('Jane Smith')).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(3);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('displays correct icon for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminIcon = screen.getByTestId('BadgeIcon');
        const employeeIcons = screen.getAllByTestId('SupervisorAccountIcon');

        expect(adminIcon).toBeInTheDocument();
        expect(employeeIcons).toHaveLength(2);
    });

    it('displays info message when no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistent');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('excludes customers from the list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
    });
});
