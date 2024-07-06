import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- fireEvent
- setup
- waitFor

- vairablen - 5
- render funktion


- 5 von 6 notwendigen Testfälen erreicht + 1 + 1 Redundanz


Best-Practices: -30
CleanCode: -30
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob Smith', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Carol White', email: 'carol@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    const renderComponent = (users = mockUsers) => render(<UserEmployeeListLeicht fetchedUsers={users} />);

    it('should render user list with correct users', () => {
        renderComponent();

        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('alice@example.com')).toBeInTheDocument();
        expect(screen.getByText('Bob Smith')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
        expect(screen.queryByText('Carol White')).not.toBeInTheDocument();
    });

    it('should update the search term and filter users', async () => {
        renderComponent();

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Alice');

        expect(searchInput).toHaveValue('Alice');
        await waitFor(() => {
            expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
            expect(screen.queryByText('Bob Smith')).not.toBeInTheDocument();
        });
    });

    it('should display message when no users match the search term', async () => {
        renderComponent();

        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'NonExistingUser');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    it('should sort users by name', async () => {
        renderComponent();

        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);

        await waitFor(() => {
            const users = screen.getAllByRole('listitem');
            expect(users[0]).toHaveTextContent('Alice Johnson');
            expect(users[1]).toHaveTextContent('Bob Smith');
        });
    });

    it('should sort users by email', async () => {
        renderComponent();

        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);

        await waitFor(() => {
            const users = screen.getAllByRole('listitem');
            expect(users[0]).toHaveTextContent('Alice Johnson');
            expect(users[1]).toHaveTextContent('Bob Smith');
        });
    });

    it('should remove a user from the list', async () => {
        renderComponent();

        const deleteButton = screen.getByLabelText('delete-Alice Johnson');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByText('Alice Johnson')).not.toBeInTheDocument();
            expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument();
        });
    });

    it('should display message when no users are available', async () => {
        renderComponent([]);

        await waitFor(() => {
            expect(screen.getByText('There are no users available')).toBeInTheDocument();
        });
    });
});
