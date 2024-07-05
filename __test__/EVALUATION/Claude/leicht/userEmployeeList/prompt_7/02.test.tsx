import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup
- node access

- doppelung keine Variable - 8


- 6 von 6 notwendigem Testumfang erreicht + 8 Redundant


Best-Practices: -20
CleanCode: -40
Testumfang: 33,4
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    it('renders the component with the correct title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays the correct number of non-customer users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(3); // Excluding the CUSTOMER role
    });

    it('displays the correct user information', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('does not display users with CUSTOMER role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.queryByText('Alice Brown')).not.toBeInTheDocument();
        expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('sorts users by name by default', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('John Doe')).toBeInTheDocument();
    });

    it('sorts users by email when email sort option is selected', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Bob Johnson')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[2]).getByText('John Doe')).toBeInTheDocument();
    });

    it('removes a user when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });

    it('displays correct icon for admin users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminListItem = screen.getByText('John Doe').closest('li');
        expect(within(adminListItem!).getByTestId('BadgeIcon')).toBeInTheDocument();
    });

    it('displays correct icon for employee users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const employeeListItem = screen.getByText('Jane Smith').closest('li');
        expect(within(employeeListItem!).getByTestId('SupervisorAccountIcon')).toBeInTheDocument();
    });

    it('displays info alert when no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistent');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays info alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('maintains filter when sorting option changes', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('maintains sort when filter changes', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const emailSortRadio = screen.getByLabelText('Email');
        await userEvent.click(emailSortRadio);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'j');
        const listItems = screen.getAllByRole('listitem');
        expect(within(listItems[0]).getByText('Jane Smith')).toBeInTheDocument();
        expect(within(listItems[1]).getByText('John Doe')).toBeInTheDocument();
    });
});
