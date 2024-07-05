import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup

- doppelung keine Variable - 4


- 5 von 6 notwendigem Testumfang erreicht + 3 Redundant


Best-Practices: -10
CleanCode: -20
Testumfang: 58,45
 */

const mockUsers: UserNoPw[] = [
    { name: 'Admin User', email: 'admin@example.com', role: USER_ROLE.ADMIN },
    { name: 'Employee User', email: 'employee@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Customer User', email: 'customer@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    it('renders the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.getByText('Employee User')).toBeInTheDocument();
        expect(screen.queryByText('Customer User')).not.toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'admin');
        expect(screen.getByText('Admin User')).toBeInTheDocument();
        expect(screen.queryByText('Employee User')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        await userEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Admin User');
        expect(listItems[1]).toHaveTextContent('Employee User');
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('admin@example.com');
        expect(listItems[1]).toHaveTextContent('employee@example.com');
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Admin User');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Admin User')).not.toBeInTheDocument();
        expect(screen.getByText('Employee User')).toBeInTheDocument();
    });

    it('displays correct icon for admin user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminListItem = screen.getByLabelText('Admin User');
        expect(within(adminListItem).getByTestId('BadgeIcon')).toBeInTheDocument();
    });

    it('displays correct icon for employee user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const employeeListItem = screen.getByLabelText('Employee User');
        expect(within(employeeListItem).getByTestId('SupervisorAccountIcon')).toBeInTheDocument();
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
});
