import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- fireEvent
- conditional

- variable - 2

- 7 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -30
CleanCode: -10
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const generateMockUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % roles.length],
    }));
};

describe('UserEmployeeListMittel Component', () => {
    const mockUsers = generateMockUsers(10);

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test.skip('renders user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    test('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'User 3');
        expect(screen.getByText('User 3')).toBeVisible();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });

    test.skip('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });

        await userEvent.click(sortBySelect);
        await userEvent.click(screen.getByLabelText('Name'));

        const userNames = Array.from(screen.getAllByText(/User \d+/)).map((el) => el.textContent);
        expect(userNames).toEqual(userNames.slice().sort());
    });

    test.skip('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });

        await userEvent.click(sortBySelect);
        await userEvent.click(screen.getByLabelText('Email'));

        const userEmails = Array.from(screen.getAllByText(/user\d+@example.com/i)).map((el) => el.textContent);
        expect(userEmails).toEqual(userEmails.slice().sort());
    });

    test('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });

        await userEvent.click(roleSelect);
        await userEvent.click(screen.getByText(USER_ROLE.ADMIN));

        mockUsers.forEach((user) => {
            if (user.role === USER_ROLE.ADMIN) {
                expect(screen.getByText(user.name)).toBeVisible();
            } else {
                expect(screen.queryByText(user.name)).not.toBeInTheDocument();
            }
        });
    });

    test.skip('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={generateMockUsers(10)} />);

        expect(screen.getByText('User 1')).toBeVisible();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        fireEvent.change(screen.getByRole('pagination'), { target: { value: 2 } });

        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 6')).toBeVisible();
    });

    test('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToRemove = mockUsers[0];

        fireEvent.click(screen.getByLabelText(`delete-${userToRemove.name}`));

        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    test('navigates to user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToEdit = mockUsers[0];

        fireEvent.click(screen.getByLabelText(`edit-${userToEdit.name}`));

        expect(useRouter().push).toHaveBeenCalledWith(`/edit/${userToEdit.name}`);
    });

    test('shows "no users available" message', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    test('shows "no users matching" message', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
