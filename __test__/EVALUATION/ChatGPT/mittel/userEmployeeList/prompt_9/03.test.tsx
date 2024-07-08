import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup

- unused import
- vairablen - 7

- 6 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -40
Testumfang: 50
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;

const mockUsers = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        mockedUseRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders without crashing', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortByEmailRadio = screen.getByLabelText('Email');
        await userEvent.click(sortByEmailRadio);
        const users = screen.getAllByRole('listitem');
        expect(users[0]).toHaveTextContent('Alice');
        expect(users[1]).toHaveTextContent('Bob');
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const roleFilter = screen.getByLabelText('Filter by Role');
        await userEvent.click(roleFilter);
        await userEvent.click(screen.getByText(USER_ROLE.EMPLOYEE));
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('paginates users', async () => {
        const manyUsers = Array.from({ length: 10 }, (_, index) => ({
            name: `User ${index + 1}`,
            email: `user${index + 1}@example.com`,
            role: USER_ROLE.EMPLOYEE,
        }));
        render(<UserEmployeeListMittel fetchedUsers={manyUsers} />);
        expect(screen.getByText('User 1')).toBeInTheDocument();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();
        const nextPageButton = screen.getByLabelText('Go to page 2');
        await userEvent.click(nextPageButton);
        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 6')).toBeInTheDocument();
    });

    it('removes a user from the list and shows a snackbar', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to user edit page on edit button click', async () => {
        const push = jest.fn();
        mockedUseRouter.mockReturnValueOnce({ push });
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const editButton = screen.getByLabelText('edit-Alice');
        await userEvent.click(editButton);
        expect(push).toHaveBeenCalledWith('/edit/Alice');
    });
});
