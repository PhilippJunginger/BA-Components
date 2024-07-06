import { render, screen, fireEvent, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- userEvent
- fireEvent
- node access
- imports from vitest
- interface

- variable

- 7 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -70
CleanCode: -5
Testumfang: 65
 */

vi.mock('next/router', () => ({
    useRouter: vi.fn(),
}));

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => {
        const name = `User ${i + 1}`;
        const email = `user${i + 1}@example.com`;
        const role = roles[i % roles.length];
        return { name, email, role };
    });
};

const defaultProps: any = {
    fetchedUsers: generateTestUsers(10),
};

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with user list', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        defaultProps.fetchedUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters users based on search term', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'User 3' } });
        expect(screen.getByText('User 3')).toBeVisible();
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
    });

    it('sorts users by name or email', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        const emailOption = within(sortBySelect).getByLabelText('Email');
        fireEvent.click(emailOption);
        const emailOrder = defaultProps.fetchedUsers
            .slice()
            .sort((a, b) => a.email.localeCompare(b.email))
            .map((user) => user.email);
        const displayedEmails = within(screen.getByRole('list'))
            .getAllByRole('listitem')
            .map((item) => within(item).getByText((content) => content.includes('@example.com')).textContent);
        expect(displayedEmails).toEqual(emailOrder);
    });

    it('filters users by role', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        fireEvent.mouseDown(roleSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        fireEvent.click(employeeOption);
        defaultProps.fetchedUsers.forEach((user) => {
            if (user.role === USER_ROLE.EMPLOYEE) {
                expect(screen.getByText(user.name)).toBeVisible();
            } else {
                expect(screen.queryByText(user.name)).not.toBeInTheDocument();
            }
        });
    });

    it('paginates the user list', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Assuming rowsPerPage is 5
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        fireEvent.click(within(pagination).getByText('2'));
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    it('removes a user from the list', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const userToRemove = defaultProps.fetchedUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        fireEvent.click(deleteButton);
        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
    });

    it('displays a snackbar message after removing a user', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const userToRemove = defaultProps.fetchedUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        fireEvent.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('navigates to the edit user page', async () => {
        const push = vi.fn();
        (useRouter as jest.Mock).mockReturnValueOnce({ push });
        render(<UserEmployeeListMittel {...defaultProps} />);
        const userToEdit = defaultProps.fetchedUsers[0];
        const editButton = screen.getByLabelText(`edit-${userToEdit.name}`);
        fireEvent.click(editButton);
        expect(push).toHaveBeenCalledWith(`/edit/${userToEdit.name}`);
    });

    it('displays a message when no users are available', () => {
        render(<UserEmployeeListMittel {...defaultProps} fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a message when no users match the search', () => {
        render(<UserEmployeeListMittel {...defaultProps} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent User' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
