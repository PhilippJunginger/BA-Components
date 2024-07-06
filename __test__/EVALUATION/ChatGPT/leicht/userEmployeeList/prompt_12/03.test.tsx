import React from 'react';
import { render, screen } from '@testing-library/react';
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
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.ADMIN },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    it('should render the component with users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
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

        const nameRadio = screen.getByLabelText('Name');
        await user.click(nameRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice Johnson');
        expect(listItems[1]).toHaveTextContent('Jane Smith');
        expect(listItems[2]).toHaveTextContent('John Doe');
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice Johnson');
        expect(listItems[1]).toHaveTextContent('Jane Smith');
        expect(listItems[2]).toHaveTextContent('John Doe');
    });

    it('should show alert when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should show alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });
});
