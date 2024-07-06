import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promises
- setup
- fireEVent

- vairablen - 5


- 5 von 6 notwendigen Testfälen erreicht + 1 A + 1 Redundanz


Best-Practices: -30
CleanCode: -25
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByLabelText('Alice Johnson')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('Alice Johnson')).not.toBeInTheDocument();
    });

    it('should sort users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const radioName = screen.getByLabelText('Name');
        fireEvent.click(radioName);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice Johnson');
        expect(userItems[1]).toHaveTextContent('Jane Smith');
        expect(userItems[2]).toHaveTextContent('John Doe');
    });

    it.skip('should sort users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const radioEmail = screen.getByLabelText('Email');
        fireEvent.click(radioEmail);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice Johnson');
        expect(userItems[1]).toHaveTextContent('John Doe');
        expect(userItems[2]).toHaveTextContent('Jane Smith');
    });

    it('should display no users available alert if no users are fetched', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should display no matching users alert if search term does not match any user', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should remove a user from the list when delete button is clicked', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        fireEvent.click(deleteButton);
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });
});
