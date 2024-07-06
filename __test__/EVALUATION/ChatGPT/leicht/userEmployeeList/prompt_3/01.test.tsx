import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent
- fireEVent
- node access

- vairablen - 6
- setup

- 5 von 6 notwendigen Testfälen erreicht + 1 Ausnahme + 3 Redundanzen


Best-Practices: -40
CleanCode: -30
Testumfang: 58,45
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    test('renders without crashing', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test('displays users correctly', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument(); // Charlie is a CUSTOMER and should not be displayed
    });

    test('displays no users available message when fetchedUsers is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('filters users based on search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        fireEvent.change(screen.getByLabelText('Search Users'), { target: { value: 'Alice' } });
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('displays no matching users message when search term does not match any user', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        fireEvent.change(screen.getByLabelText('Search Users'), { target: { value: 'Nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('sorts users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        fireEvent.click(screen.getByLabelText('Name'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice');
        expect(userItems[1]).toHaveTextContent('Bob');
    });

    test('sorts users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        fireEvent.click(screen.getByLabelText('Email'));
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('Alice');
        expect(userItems[1]).toHaveTextContent('Bob');
    });

    test('removes user from list when delete button is clicked', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        fireEvent.click(screen.getByLabelText('delete-Alice'));
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    test('displays correct icons for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        expect(screen.getByLabelText('Alice').querySelector('svg')).toHaveAttribute('data-testid', 'BadgeIcon');
        expect(screen.getByLabelText('Bob').querySelector('svg')).toHaveAttribute(
            'data-testid',
            'SupervisorAccountIcon',
        );
    });
});
