import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*

- unused import
- vairablen - 6
- enum
- typeerror

- 6 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: 0
CleanCode: -40
Testumfang: 55
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
useRouter.mockImplementation(() => ({
    push: mockPush,
}));

const fetchedUsers = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Doe', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Customer', email: 'customer@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListMittel Component', () => {
    it('should render the component with the given users', () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane@example.com')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should sort users based on selected criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);

        const users = screen.getAllByRole('listitem');
        expect(users[0]).toHaveTextContent('Jane Doe');
        expect(users[1]).toHaveTextContent('John Doe');
    });

    it('should filter users based on role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const roleFilter = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleFilter);
        await userEvent.click(screen.getByRole('option', { name: 'EMPLOYEE' }));

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await userEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(await screen.findByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={fetchedUsers} />);

        const editButton = screen.getByLabelText('edit-Jane Doe');
        await userEvent.click(editButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/edit/Jane Doe');
        });
    });

    it.skip('should handle pagination correctly', async () => {
        const manyUsers = Array.from({ length: 20 }, (_, i) => ({
            name: `User ${i}`,
            email: `user${i}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));

        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);

        expect(screen.getAllByRole('listitem')).toHaveLength(5);

        const nextPageButton = screen.getByRole('button', { name: 'Go to page 2' });
        await userEvent.click(nextPageButton);

        expect(screen.getAllByRole('listitem')).toHaveLength(5);
        expect(screen.getByText('User 5')).toBeInTheDocument();
    });
});
