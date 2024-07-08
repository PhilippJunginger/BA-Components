import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- render in beforeEach

- enum
- unused import
- vairablen - 5
- typeerror

- 7 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -45
Testumfang: 65
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    // Add more mock users as needed
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
    });

    it.skip('should display the correct number of users', () => {
        const userItems = screen.getAllByRole('listitem');
        expect(userItems.length).toBe(mockUsers.length);
    });

    it.skip('should filter users based on search input', async () => {
        const searchInput = screen.getByLabelText(/search users/i);
        await user.type(searchInput, 'Alice');
        expect(screen.getByText(/alice/i)).toBeInTheDocument();
        expect(screen.queryByText(/bob/i)).not.toBeInTheDocument();
    });

    it('should display a message when no users match the search', async () => {
        const searchInput = screen.getByLabelText(/search users/i);
        await user.type(searchInput, 'Nonexistent');
        expect(screen.getByText(/there are no users matching the current search/i)).toBeInTheDocument();
    });

    it('should sort users by name and email', async () => {
        const nameRadio = screen.getByLabelText(/name/i);
        const emailRadio = screen.getByLabelText(/email/i);

        await user.click(emailRadio);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0]).toHaveTextContent('alice@example.com');

        await user.click(nameRadio);
        const sortedUserItems = screen.getAllByRole('listitem');
        expect(sortedUserItems[0]).toHaveTextContent('Alice');
    });

    it.skip('should filter users by role', async () => {
        const filterSelect = screen.getByLabelText(/filter by role/i);
        await user.selectOptions(filterSelect, USER_ROLE.EMPLOYEE);
        expect(screen.queryByText(/alice/i)).not.toBeInTheDocument();
        expect(screen.getByText(/bob/i)).toBeInTheDocument();
    });

    it('should handle pagination correctly', async () => {
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
    });

    it('should remove user from list and display snackbar message', async () => {
        const deleteButton = screen.getByLabelText(/delete-alice/i);
        await user.click(deleteButton);
        expect(screen.queryByText(/alice/i)).not.toBeInTheDocument();
        expect(screen.getByText(/user removed successfully/i)).toBeInTheDocument();
    });

    it('should navigate to user edit page on edit button click', async () => {
        const editButton = screen.getByLabelText(/edit-alice/i);
        await user.click(editButton);
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });
});
