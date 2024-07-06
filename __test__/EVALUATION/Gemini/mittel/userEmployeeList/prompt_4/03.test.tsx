import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- conditional

- unused import
- variable - 2

- 7 von 10 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -20
CleanCode: -15
Testumfang: 60
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const generateSampleUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % roles.length],
    }));
};

describe('UserEmployeeListMittel Component', () => {
    const mockUsers: UserNoPw[] = generateSampleUsers(10);

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test.skip('renders user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        mockUsers
            .filter((user) => user.role !== USER_ROLE.CUSTOMER)
            .forEach((user) => {
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
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(sortBySelect);
        const nameOption = screen.getByLabelText('Name');
        await userEvent.click(nameOption);
        const userNames = screen.getAllByText(/User \d+/).map((user) => user.textContent);
        expect(userNames).toEqual(userNames.slice().sort());
    });

    test.skip('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(sortBySelect);
        const emailOption = screen.getByLabelText('Email');
        await userEvent.click(emailOption);
        const emails = screen.getAllByText(/user\d+@example.com/).map((email) => email.textContent);
        expect(emails).toEqual(emails.slice().sort());
    });

    test('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        await userEvent.click(employeeOption);
        mockUsers.forEach((user) => {
            if (user.role === USER_ROLE.EMPLOYEE) {
                expect(screen.getByText(user.name)).toBeVisible();
            } else {
                expect(screen.queryByText(user.name)).not.toBeInTheDocument();
            }
        });
    });

    test.skip('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const pageButtons = screen.getAllByRole('button', { name: /Go to page \d+/ });
        expect(pageButtons).toHaveLength(Math.ceil(mockUsers.length / 5));
        await userEvent.click(pageButtons[1]);
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 6')).toBeVisible();
    });

    test('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToRemove = mockUsers[2];
        const deleteButton = screen.getAllByLabelText(`delete-${userToRemove.name}`)[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText(userToRemove.email)).not.toBeInTheDocument();
    });

    test('navigates to user edit page', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToEdit = mockUsers[0];
        const editButton = screen.getAllByLabelText(`edit-${userToEdit.name}`)[0];
        await userEvent.click(editButton);
        expect(pushMock).toHaveBeenCalledWith(`/edit/${userToEdit.name}`);
    });

    test('shows snackbar on user removal', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToRemove = mockUsers[1];
        const deleteButton = screen.getAllByLabelText(`delete-${userToRemove.name}`)[0];
        await userEvent.click(deleteButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    test('shows "no users" message when no users match search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    test('shows "no users" message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });
});
