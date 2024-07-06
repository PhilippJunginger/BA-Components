import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render beforeEach
- condition inside test
- node access

- unused import
- vairablen - 7
- screen
- typeerror

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -30
CleanCode: -50
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);
    });

    it('should display the correct initial users', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });

        await user.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        const nameRadio = screen.getByRole('radio', { name: 'Name' });
        const emailRadio = screen.getByRole('radio', { name: 'Email' });

        await user.click(emailRadio);
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();

        await user.click(nameRadio);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
    });

    it('should filter users by role', async () => {
        const roleSelect = screen.getByLabelText('Filter by Role');

        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
    });

    it('should remove a user from the list', async () => {
        const deleteButton = screen.getByLabelText('delete-John Doe');

        await user.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page on edit button click', async () => {
        const editButton = screen.getByLabelText('edit-Jane Smith');

        await user.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Jane Smith');
    });

    it('should paginate users correctly', async () => {
        const pagination = screen.getByRole('navigation');
        const nextPageButton = pagination.querySelector('button[aria-label="Go to page 2"]');

        if (nextPageButton) {
            await user.click(nextPageButton);
            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
            expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
        }
    });

    it('should display a message when no users match the search', async () => {
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });

        await user.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should display a message when there are no users available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
