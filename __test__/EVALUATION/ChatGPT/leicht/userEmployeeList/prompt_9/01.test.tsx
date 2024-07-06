import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promise
- setup
- overloaded test

- vairablen - 2
- unused import


- 5 von 6 notwendigen Testfälen erreicht


Best-Practices: -30
CleanCode: -15
Testumfang: 83,
 */

const mockUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Brown', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListLeicht', () => {
    it('should display user list with sorting and search functionality', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Check initial render
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeChecked();
        expect(screen.getByLabelText('Email')).not.toBeChecked();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();

        // Check users are displayed
        mockUsers.forEach((user) => {
            expect(screen.getByLabelText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });

        // Search functionality
        await userEvent.type(screen.getByLabelText('Search Users'), 'Jane');
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();

        // Clear search
        await userEvent.clear(screen.getByLabelText('Search Users'));
        mockUsers.forEach((user) => {
            expect(screen.getByLabelText(user.name)).toBeInTheDocument();
        });

        // Sort by email
        await userEvent.click(screen.getByLabelText('Email'));
        expect(screen.getByLabelText('Email')).toBeChecked();
        expect(screen.getByLabelText('Name')).not.toBeChecked();

        // Verify sort by email
        const sortedUsers = [...mockUsers].sort((a, b) => a.email.localeCompare(b.email));
        sortedUsers.forEach((user, index) => {
            const userItems = screen.getAllByRole('listitem');
            expect(userItems[index]).toHaveTextContent(user.name);
            expect(userItems[index]).toHaveTextContent(user.email);
        });
    });

    it('should handle user removal from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        // Remove a user
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        // Verify user is removed
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('john@example.com')).not.toBeInTheDocument();
    });

    it('should display no users message when list is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should display no matching users message when search has no results', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        await userEvent.type(screen.getByLabelText('Search Users'), 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
