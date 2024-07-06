import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup

- unused import 
- vairablen - 7

- 7 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -40
Testumfang: 60
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Dave', email: 'dave@example.com', role: USER_ROLE.ADMIN },
    { name: 'Eve', email: 'eve@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Frank', email: 'frank@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    test('renders the component', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    test.skip('displays all users initially', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getAllByRole('listitem').length).toBe(5);
    });

    test('searches users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortByName = screen.getByLabelText('Name');
        const sortByEmail = screen.getByLabelText('Email');

        await userEvent.click(sortByName);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice');

        await userEvent.click(sortByEmail);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice');
    });

    test.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const filterSelect = screen.getByLabelText('Filter by Role');

        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        expect(screen.getAllByRole('listitem').length).toBe(2);
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('handles pagination', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const pagination = screen.getByLabelText('Go to page 2');

        await userEvent.click(pagination);
        expect(screen.getByText('Frank')).toBeInTheDocument();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    test('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');

        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        });
    });

    test('navigates to user edit page', async () => {
        const { push } = useRouter();
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-Alice');

        await userEvent.click(editButton);
        expect(push).toHaveBeenCalledWith('/edit/Alice');
    });

    test('displays a snackbar message when a user is removed', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');

        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
        });
    });
});
