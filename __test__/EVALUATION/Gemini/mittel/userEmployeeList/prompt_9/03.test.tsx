import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup

- vairablen - 4

- 4 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -20
Tetumfang: 35
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'David', email: 'david@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it.skip('sorts users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const sortByRadios = screen.getAllByRole('radio');

        // Sort by email (descending order)
        await userEvent.click(sortByRadios[1]);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Eve');

        // Sort by name (ascending order)
        await userEvent.click(sortByRadios[0]);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice');
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const filterSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);

        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it.skip('paginates users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        // Should show first 5 items initially
        expect(screen.getAllByRole('listitem')).toHaveLength(5);

        // Click on the next page button
        const nextPageButton = screen.getByLabelText('Go to next page');
        await userEvent.click(nextPageButton);
        await waitFor(() => {
            // Should now display last item
            expect(screen.getByText('Eve')).toBeInTheDocument();
        });
    });

    // ... (tests for edit/delete functionality, snackbar, etc.)
});
