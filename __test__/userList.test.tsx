import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserEmployeeList from '../components/leicht/userEmployeeList';
import { User } from '../models/user';

describe('UserList Component', () => {
    const mockUsers = [
        { name: 'Alice', email: 'alice@example.com', role: 'CUSTOMER' },
        { name: 'Bob', email: 'bob@example.com', role: 'EMPLOYEE' },
        { name: 'Cara', email: 'cara@example.com', role: 'ADMIN' },
    ];

    test('renders UserList with default sort by name', () => {
        render(<UserEmployeeList fetchedUsers={mockUsers as User[]} />);
        const items = screen.getAllByRole('listitem');
        expect(items).toHaveLength(mockUsers.length);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        //expect(screen.getByLabelText('Name').checked).toBe(true);
    });

    test('filters users by search term', () => {
        render(<UserEmployeeList fetchedUsers={mockUsers as User[]} />);
        const searchBox = screen.getByLabelText('Search Users');
        fireEvent.change(searchBox, { target: { value: 'Bob' } });
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    test('changes sort order to email', async () => {
        render(<UserEmployeeList fetchedUsers={mockUsers as User[]} />);
        const sortRadioEmail = screen.getByLabelText('Email');
        await userEvent.click(sortRadioEmail);
        //expect(sortRadioEmail.checked).toBe(true);
    });

    test('removes user from list', async () => {
        render(<UserEmployeeList fetchedUsers={mockUsers as User[]} />);
        const deleteButton = screen.getByRole('button', { name: 'Alice' }); // Assuming the first delete button corresponds to Alice
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.queryByText('Bob')).toBeInTheDocument();
    });

    test('displays no users available message when list is empty', () => {
        render(<UserEmployeeList fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available or matching the current search')).toBeInTheDocument();
    });

    test.skip('displays appropriate icons for different user roles', () => {
        render(<UserEmployeeList fetchedUsers={mockUsers as User[]} />);
        expect(screen.getByLabelText('Person')).toBeInTheDocument(); // Assuming label is provided for accessibility
        expect(screen.getByLabelText('Badge')).toBeInTheDocument(); // Assuming label is provided for accessibility
        expect(screen.getByLabelText('Supervisor Account')).toBeInTheDocument(); // Assuming label is provided for accessibility
    });
});
