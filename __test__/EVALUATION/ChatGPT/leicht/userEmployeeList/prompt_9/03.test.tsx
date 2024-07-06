import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent
- fireEvent

- vairablen - 4
- unused import


- 6 von 6 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -30
CleanCode: -25
Testumfang: 83,5
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders User List title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test('displays initial users excluding customers', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.getByLabelText('Bob')).toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).toBeNull();
    });

    test('displays alert when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('filters users based on search input', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'alice' } });
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).toBeNull();
    });

    test('displays alert when no users match the search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('sorts users by name and email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const sortByEmail = screen.getByLabelText('Email');
        fireEvent.click(sortByEmail);
        const sortedUsers = screen.getAllByRole('listitem');
        expect(sortedUsers[0]).toHaveTextContent('Alice');
        expect(sortedUsers[1]).toHaveTextContent('Bob');
    });

    test('removes user from list on delete button click', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        fireEvent.click(deleteButton);
        expect(screen.queryByLabelText('Alice')).toBeNull();
    });

    test('displays correct icon for each user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getAllByTestId('BadgeIcon').length).toBe(1); // For ADMIN
        expect(screen.getAllByTestId('SupervisorAccountIcon').length).toBe(1); // For EMPLOYEE
    });
});
