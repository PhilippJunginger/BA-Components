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


- 5 von 6 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -20
CleanCode: -25
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Dave', email: 'dave@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    it('renders the component with users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.getByLabelText('Bob')).toBeInTheDocument();
        expect(screen.getByLabelText('Charlie')).toBeInTheDocument();
        expect(screen.queryByLabelText('Dave')).not.toBeInTheDocument();
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice');
        expect(listItems[1]).toHaveTextContent('Bob');
        expect(listItems[2]).toHaveTextContent('Charlie');
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument();
    });

    it('shows info alert when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('shows info alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
