import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- setup

- doppelung keine Variable - 5


- 5 von 6 notwendigem Testumfang erreicht + 2 Redundant


Best-Practices: -10
CleanCode: -25
Testumfang: 66,8
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Johnson', email: 'bob@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    it('renders the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('Bob Johnson')).not.toBeInTheDocument(); // Customer should not be shown
    });

    it('allows sorting by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        expect(nameRadio).toBeChecked();

        await userEvent.click(emailRadio);
        expect(emailRadio).toBeChecked();

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it('removes a user when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const deleteJohnButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteJohnButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('displays correct icon for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const johnListItem = screen.getByLabelText('John Doe');
        const janeListItem = screen.getByLabelText('Jane Smith');

        expect(within(johnListItem).getByTestId('BadgeIcon')).toBeInTheDocument();
        expect(within(janeListItem).getByTestId('SupervisorAccountIcon')).toBeInTheDocument();
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
});
