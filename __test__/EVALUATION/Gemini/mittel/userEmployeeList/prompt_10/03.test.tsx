import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';

/*
- setup

- vairablen - 1
- enum
- const missing


- 5 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -15
Tetumfang: 45
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    { email: 'admin@test.com', name: 'Admin User', role: USER_ROLE.ADMIN },
    { email: 'employee1@test.com', name: 'John Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'employee2@test.com', name: 'Jane Smith', role: USER_ROLE.EMPLOYEE },
    // ...more mock users to test pagination and filtering
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it.skip('renders users and pagination', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        mockUsers.slice(0, rowsPerPage).forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
        expect(screen.getByRole('navigation', { name: 'pagination' })).toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument(); // Filtered out
    });

    it.skip('sorts users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        await userEvent.click(screen.getByLabelText('Sort by'));
        await userEvent.click(screen.getByLabelText('Email'));

        const listItems = screen.getAllByRole('listitem');
        const emails = listItems.map((item) => within(item).getByText(/@test.com/)).map((el) => el.textContent);
        expect(emails).toEqual(mockUsers.map((u) => u.email).sort()); // Check if sorted alphabetically
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        await userEvent.click(screen.getByLabelText('Filter by Role'));
        await userEvent.click(screen.getByText('EMPLOYEE'));

        expect(screen.getAllByRole('listitem')).toHaveLength(2); // Assuming 2 employees
    });

    it('navigates to edit page on click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const editButton = within(screen.getAllByRole('listitem')[0]).getByLabelText(`edit-${mockUsers[0].name}`);
        await userEvent.click(editButton);

        expect(useRouter().push).toHaveBeenCalledWith(`/edit/${mockUsers[0].name}`);
    });

    it('removes user from list and shows snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const deleteButton = within(screen.getAllByRole('listitem')[0]).getByLabelText(`delete-${mockUsers[0].name}`);
        await userEvent.click(deleteButton);

        expect(screen.queryByText(mockUsers[0].name)).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });
});
