import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- fireEvent
- conditional
- node access

- variable -
- unused const - 2

- 8 von 10 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -40
CleanCode: -15
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const generateMockUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % 2],
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
        const nameOption = screen.getByLabelText('Name');
        fireEvent.click(nameOption);
        const userNames = screen.getAllByText(/User \d+/).map((node) => node.textContent);
        expect(userNames).toEqual(userNames.slice().sort());
    });

    test.skip('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        await userEvent.click(sortBySelect);
        const emailOption = screen.getByLabelText('Email');
        fireEvent.click(emailOption);
        const emails = screen.getAllByText(/user\d+@example.com/).map((node) => node.textContent);
        expect(emails).toEqual(emails.slice().sort());
    });

    test('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleSelect = screen.getByRole('combobox', { name: /filter by role/i });
        await userEvent.click(roleSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        fireEvent.click(employeeOption);
        mockUsers.forEach((user) => {
            if (user.role === USER_ROLE.EMPLOYEE) {
                expect(screen.getByText(user.name)).toBeVisible();
            } else {
                expect(screen.queryByText(user.name)).not.toBeInTheDocument();
            }
        });
    });

    test.skip('paginates users correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={generateMockUsers(10)} />);
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        const pagination = screen.getByRole('navigation');
        const nextPageButton = pagination.querySelector('button[aria-label="Go to next page"]');
        if (nextPageButton) {
            fireEvent.click(nextPageButton);
        }
        expect(screen.getAllByRole('listitem')).toHaveLength(5);
    });

    test('removes user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToRemove = mockUsers[0];
        const deleteButton = screen.getByLabelText(`delete-${userToRemove.name}`);
        fireEvent.click(deleteButton);
        expect(screen.queryByText(userToRemove.name)).not.toBeInTheDocument();
    });

    test('shows snackbar on user removal', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getAllByLabelText(/delete-/i)[0];
        fireEvent.click(deleteButton);
        const snackbar = screen.getByRole('alert');
        expect(snackbar).toBeVisible();
        expect(snackbar).toHaveTextContent('User removed successfully!');
    });

    test('navigates to user edit page', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const userToEdit = mockUsers[0];
        const editButton = screen.getByLabelText(`edit-${userToEdit.name}`);
        fireEvent.click(editButton);
        expect(pushMock).toHaveBeenCalledWith(`/edit/${userToEdit.name}`);
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
