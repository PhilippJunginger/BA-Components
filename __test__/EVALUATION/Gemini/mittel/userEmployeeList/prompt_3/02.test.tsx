import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- userEvent
- fireEvent
- node access
- imports from vitest
- conditional assertion

- variable

- 8 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -70
CleanCode: -5
Testumfang: 75
 */

vi.mock('next/router', () => ({
    useRouter: vi.fn(),
}));

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        role: roles[i % 2],
    }));
};

describe('UserEmployeeListMittel Component', () => {
    const testUsers = generateTestUsers(10);

    it('renders the component with user data', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('renders a message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('filters users based on search term', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Test User 3' } });
        expect(screen.getByText('Test User 3')).toBeVisible();
        expect(screen.queryByText('Test User 1')).not.toBeInTheDocument();
    });

    it('sorts users by name', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        fireEvent.click(sortBySelect.querySelector('input[value="name"]')!);
        const userNames = Array.from(screen.getAllByRole('listitem'))
            .map((item) => item.textContent?.split('\n')[0].trim())
            .filter((name) => !!name) as string[];
        expect(userNames).toEqual(userNames.slice().sort());
    });

    it('sorts users by email', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        fireEvent.click(sortBySelect.querySelector('input[value="email"]')!);
        const emails = Array.from(screen.getAllByRole('listitem'))
            .map((item) => item.textContent?.split('\n')[1].trim())
            .filter((email) => !!email) as string[];
        expect(emails).toEqual(emails.slice().sort());
    });

    it('filters users by role', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        testUsers.forEach((user) => {
            if (user.role === USER_ROLE.ADMIN) {
                expect(screen.getByText(user.name)).toBeVisible();
            } else {
                expect(screen.queryByText(user.name)).not.toBeInTheDocument();
            }
        });
    });

    it('paginates users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Check if only the first 5 users are displayed initially
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        // Click on the second page
        fireEvent.click(screen.getByText('2'));
        // Check if the next 5 users are displayed
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    it('removes a user from the list', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const userToRemove = testUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        fireEvent.click(deleteButton);
        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
    });

    it('displays a snackbar message after removing a user', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const userToRemove = testUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        fireEvent.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('navigates to the user edit page', async () => {
        const push = vi.fn();
        (useRouter as any).mockReturnValue({ push });
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const userToEdit = testUsers[0];
        const editButton = screen.getByLabelText(`edit-${userToEdit.name}`);
        fireEvent.click(editButton);
        expect(push).toHaveBeenCalledWith(`/edit/${userToEdit.name}`);
    });

    it('displays a message when no users match the search', () => {
        render(<UserEmployeeListMittel fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent User' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
