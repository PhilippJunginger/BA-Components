import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- node access

- vairablen - 4
- unused import

- 6 von 6 notwendigen Testfälen erreicht + 2 Redundanzen


Best-Practices: -10
CleanCode: -25
Testumfang: 83,5
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    it.skip('should render the component with initial props', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
    });

    it('should filter out CUSTOMER role users and display ADMIN and EMPLOYEE users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should display an alert when no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should display an alert when there are no users available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should update the search term state and filter users accordingly', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should update the sortBy state and sort users accordingly', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        await user.click(sortByEmailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('should remove a user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should display the correct icon for each user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('John Doe').querySelector('svg[data-testid="BadgeIcon"]')).toBeInTheDocument();
        expect(
            screen.getByLabelText('Jane Smith').querySelector('svg[data-testid="SupervisorAccountIcon"]'),
        ).toBeInTheDocument();
    });
});
