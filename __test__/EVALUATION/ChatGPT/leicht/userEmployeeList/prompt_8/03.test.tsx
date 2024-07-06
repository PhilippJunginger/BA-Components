import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- vairablen - 5
- unused import


- 5 von 6 notwendigen Testfälen erreicht + 1 A + 1 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Brown', email: 'bob@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    it('should render the component with initial users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('Bob Brown')).not.toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const radioName = screen.getByLabelText('Name');
        await user.click(radioName);

        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Alice Johnson');
        expect(userList[1]).toHaveTextContent('Jane Smith');
        expect(userList[2]).toHaveTextContent('John Doe');
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const radioEmail = screen.getByLabelText('Email');
        await user.click(radioEmail);

        const userList = screen.getAllByRole('listitem');
        expect(userList[0]).toHaveTextContent('Alice Johnson');
        expect(userList[1]).toHaveTextContent('Jane Smith');
        expect(userList[2]).toHaveTextContent('John Doe');
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const deleteButton = screen.getByLabelText('delete-Jane Smith');
        await user.click(deleteButton);

        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('should show no users available message when no users are fetched', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should show no users matching search message when search term does not match any user', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
