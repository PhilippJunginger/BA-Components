import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent fehlt
- fireEvent
- node access

- vairablen - 6
- unused import

- 5 von 6 notwendigen Testfälen erreicht + 1 A + 2 Redundanzen


Best-Practices: -40
CleanCode: -35
Testumfang: 66,8
 */

describe('UserEmployeeListLeicht Component', () => {
    const fetchedUsers: UserNoPw[] = [
        { name: 'Alice Admin', email: 'alice@admin.com', role: USER_ROLE.ADMIN },
        { name: 'Bob Employee', email: 'bob@employee.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Charlie Customer', email: 'charlie@customer.com', role: USER_ROLE.CUSTOMER },
    ];

    it('renders without crashing', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays an alert if no users are fetched', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('filters out CUSTOMER role users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.queryByText('Charlie Customer')).not.toBeInTheDocument();
    });

    it('sorts users by name by default', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice Admin');
        expect(listItems[1]).toHaveTextContent('Bob Employee');
    });

    it('updates the search term and filters the user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Bob' } });
        expect(screen.queryByText('Alice Admin')).not.toBeInTheDocument();
        expect(screen.getByText('Bob Employee')).toBeInTheDocument();
    });

    it('shows alert when no users match the search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('sorts users by email when selected', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const emailSortRadio = screen.getByLabelText('Email');
        fireEvent.click(emailSortRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Alice Admin');
        expect(listItems[1]).toHaveTextContent('Bob Employee');
    });

    it('removes a user from the list when delete button is clicked', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice Admin');
        fireEvent.click(deleteButton);
        expect(screen.queryByText('Alice Admin')).not.toBeInTheDocument();
        expect(screen.getByText('Bob Employee')).toBeInTheDocument();
    });

    it('displays appropriate icons for different user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.getByLabelText('Alice Admin').querySelector('svg')).toHaveClass('MuiSvgIcon-root');
        expect(screen.getByLabelText('Bob Employee').querySelector('svg')).toHaveClass('MuiSvgIcon-root');
    });
});
