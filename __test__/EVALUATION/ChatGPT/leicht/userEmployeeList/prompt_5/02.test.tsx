import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- promises
- setup

- vairablen - 3
- unused import

- 6 von 6 notwendigen Testfälen erreicht


Best-Practices: -20
CleanCode: -20
Testumfang: 100
 */

const fetchedUsers = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht', () => {
    test('renders user list with fetched users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.getByLabelText('Bob')).toBeInTheDocument();
        expect(screen.queryByLabelText('Charlie')).not.toBeInTheDocument();
    });

    test('filters users by search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
    });

    test('sorts users by name and email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');
        await userEvent.click(emailRadio);
        expect(screen.getByLabelText('Email')).toBeChecked();
        await userEvent.click(nameRadio);
        expect(screen.getByLabelText('Name')).toBeChecked();
    });

    test('displays message when no users match search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    test('displays message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    test('removes user from list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);
        const deleteButton = screen.getByLabelText('delete-Alice');
        await userEvent.click(deleteButton);
        expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument();
    });
});
