import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promises
- setup
- import of module

- vairablen - 4
- unused import

- 5 von 6 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -25
Testumfang: 66,8
 */

expect.extend(toHaveNoViolations);

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Customer User', email: 'customer@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('Customer User')).not.toBeInTheDocument();
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'john');
        expect(screen.getByLabelText('John Doe')).toBeInTheDocument();
        expect(screen.queryByLabelText('Jane Smith')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const radioEmail = screen.getByLabelText('Email');
        await userEvent.click(radioEmail);

        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Smith');
        expect(listItems[1]).toHaveTextContent('John Doe');
    });

    test('removes user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const deleteButton = screen.getByLabelText('delete-Jane Smith');
        await userEvent.click(deleteButton);

        expect(screen.queryByLabelText('Jane Smith')).not.toBeInTheDocument();
    });

    test('shows alert when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'notarealuser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('shows alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('has no accessibility violations', async () => {
        const { container } = render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
    });
});
