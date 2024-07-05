import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup
- fireEvent
- node access

- doppelung keine Variable - 4


- 5 von 6 notwendigem Testumfang erreicht + 4 Redundant


Best-Practices: -30
CleanCode: -20
Testumfang: 50,1
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test('renders component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    test('sorts users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('jane@example.com');
        expect(listItems[1]).toHaveTextContent('john@example.com');
    });

    test('removes user from list when delete button is clicked', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        fireEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
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

    test('renders correct icon for admin user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const adminListItem = screen.getByLabelText('John Doe');
        expect(adminListItem.querySelector('svg[data-testid="BadgeIcon"]')).toBeInTheDocument();
    });

    test('renders correct icon for employee user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const employeeListItem = screen.getByLabelText('Jane Smith');
        expect(employeeListItem.querySelector('svg[data-testid="SupervisorAccountIcon"]')).toBeInTheDocument();
    });
});
