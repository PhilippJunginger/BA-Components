import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import { ChangeEvent, MouseEvent } from 'react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- promises
- fireEvent

- variable - 4
- unused import

- 8 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -30
CleanCode: -25
Testumfang: 75
 */

const mockUsers: UserNoPw[] = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        name: 'Jack Doe',
        email: 'jack.doe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
];

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserEmployeeListMittel', () => {
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
    });

    it('renders the component with user list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('user-list')).toBeInTheDocument();
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeVisible();
            expect(screen.getByText(user.email)).toBeVisible();
        });
    });

    it.skip('filters users based on search term', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'john' } });
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeVisible();
        expect(screen.queryByText('Jack Doe')).not.toBeVisible();
    });

    it.skip('sorts users by name', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const [john, jack, jane] = mockUsers;

        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(jack.name);
        expect(userItems[1]).toHaveTextContent(jane.name);
        expect(userItems[2]).toHaveTextContent(john.name);
    });

    it.skip('sorts users by email', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const [john, jane, jack] = mockUsers;

        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);

        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent(jack.email);
        expect(userItems[1]).toHaveTextContent(john.email);
        expect(userItems[2]).toHaveTextContent(jane.email);
    });

    it.skip('filters users by role', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.mouseDown(roleSelect);
        const employeeOption = screen.getByText('EMPLOYEE');
        fireEvent.click(employeeOption);

        expect(screen.queryByText('John Doe')).not.toBeVisible();
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Jack Doe')).toBeVisible();
    });

    it.skip('paginates users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Jack Doe')).toBeVisible();

        // Only two pages should exist
        const pageItems = screen.getAllByRole('button', { name: /Go to page/i });
        expect(pageItems.length).toBe(2);

        fireEvent.click(pageItems[1]);

        // Since there are only three users and two fit per page,
        // the third should be the only one visible
        expect(screen.queryByText('John Doe')).not.toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeVisible();
        expect(screen.getByText('Jack Doe')).toBeVisible();
    });

    it.skip('removes a user from the list', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const deleteButtons = screen.getAllByLabelText(/delete/i);

        // Click the first delete button
        fireEvent.click(deleteButtons[0]);

        expect(screen.queryByText('John Doe')).not.toBeVisible();
        expect(screen.getByText('Jane Doe')).toBeVisible();
    });

    it('displays a snackbar message after removing a user', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const deleteButtons = screen.getAllByLabelText(/delete/i);

        fireEvent.click(deleteButtons[0]);

        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it.skip('navigates to the edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButtons = screen.getAllByLabelText(/edit/i);

        // Click the first edit button
        await userEvent.click(editButtons[0]);

        expect(mockRouterPush).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('shows a message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('shows a message when no users match the search criteria', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
