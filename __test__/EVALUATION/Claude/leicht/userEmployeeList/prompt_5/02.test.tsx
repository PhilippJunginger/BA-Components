import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
-setup


- doppelung keine Variable - 6


- 5 von 6 notwendigem Testumfang erreicht + 3 Redundant


Best-Practices: -10
CleanCode: -30
Testumfang: 58,45
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test.skip('renders user list correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3); // Excludes CUSTOMER

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test.skip('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        // Default sort is by name
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('John Doe')).toBeInTheDocument();

        // Sort by email
        await userEvent.click(emailRadio);
        const listItemsAfterEmailSort = screen.getAllByRole('listitem');
        expect(within(listItemsAfterEmailSort[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItemsAfterEmailSort[1]).getByText('Jane Smith')).toBeInTheDocument();

        // Sort back by name
        await userEvent.click(nameRadio);
        const listItemsAfterNameSort = screen.getAllByRole('listitem');
        expect(within(listItemsAfterNameSort[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItemsAfterNameSort[1]).getByText('Jane Smith')).toBeInTheDocument();
    });

    test('removes user from list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    test('displays correct icon for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const adminListItem = screen.getByText('John Doe').closest('li');
        const employeeListItem = screen.getByText('Jane Smith').closest('li');

        expect(within(adminListItem!).getByTestId('BadgeIcon')).toBeInTheDocument();
        expect(within(employeeListItem!).getByTestId('SupervisorAccountIcon')).toBeInTheDocument();
    });

    test('displays info message when no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistent');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays info message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('excludes customers from the list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
    });
});
