import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promises
- setup

- vairablen - 4
- unused import

- 6 von 6 notwendigen Testfälen erreicht


Best-Practices: -20
CleanCode: -25
Testumfang: 100
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'David', email: 'david@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test('renders user list and allows searching', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Check if the user list is rendered
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.getByText('Charlie')).toBeInTheDocument();
        expect(screen.queryByText('David')).not.toBeInTheDocument();

        // Perform a search
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'bob');
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument();
    });

    test('filters out customers and sorts by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Customers should not be in the list
        expect(screen.queryByText('David')).not.toBeInTheDocument();

        // Check initial sort by name
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice');
        expect(listItems[1]).toHaveTextContent('Bob');
        expect(listItems[2]).toHaveTextContent('Charlie');
    });

    test('allows sorting by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Change sort to email
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice');
        expect(listItems[1]).toHaveTextContent('Bob');
        expect(listItems[2]).toHaveTextContent('Charlie');
    });

    test('removes a user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Ensure user is in the list
        expect(screen.getByText('Alice')).toBeInTheDocument();

        // Click delete button
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);

        // Ensure user is removed from the list
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    test('shows appropriate message when no users match search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Perform a search with no matches
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');

        // Check for "no users matching" alert
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('shows appropriate message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        // Check for "no users available" alert
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
