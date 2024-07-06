import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- userEvent
- fireEvent

- unused import
- vairablen - 6
- typeerror

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -40
Testumfang: 75
 */

// Mocking next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
useRouter.mockReturnValue({
    push: mockPush,
});

// Sample data
const users = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Dave', email: 'dave@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Frank', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    it.skip('renders user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('filters users by search term', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Alice' } });
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users by email', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        fireEvent.click(screen.getByLabelText('Email'));
        const userListItems = screen.getAllByRole('listitem');
        expect(userListItems[0]).toHaveTextContent('Alice');
        expect(userListItems[1]).toHaveTextContent('Bob');
    });

    it.skip('filters users by role', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const roleFilter = screen.getByLabelText('Filter by Role');
        fireEvent.change(roleFilter, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('removes user from list and shows snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        fireEvent.click(deleteButton);
        await waitFor(() => expect(screen.queryByText('Alice')).not.toBeInTheDocument());
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to user edit page on edit button click', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const editButton = screen.getByLabelText('edit-Alice');
        fireEvent.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    it.skip('paginates user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        fireEvent.click(screen.getByLabelText('Go to page 2'));
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('displays message when no users match search', () => {
        render(<UserEmployeeListMittel fetchedUsers={users} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('displays message when no users available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
