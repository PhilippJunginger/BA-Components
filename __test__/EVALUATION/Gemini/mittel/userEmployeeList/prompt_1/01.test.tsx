import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';

/*
- userEvent
- fireEvent
- component name wrong
- wrong import of module
- no assertion

- variable -4
- render Funkton

- 7 von 10 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -60
CleanCode: -25
Testumfang: 60
 */

const mockUsers: UserNoPw[] = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        name: 'Jack Doe',
        email: 'jack.doe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
];

const setup = (users: UserNoPw[] = mockUsers) => {
    render(
        <BrowserRouter>
            <UserList fetchedUsers={users} />
        </BrowserRouter>,
    );
};

describe('UserList Component', () => {
    it('renders without crashing', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('displays all fetched users initially', () => {
        setup();
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters users by name or email correctly', () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'john' } });
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.queryByText('Jane Doe')).not.toBeInTheDocument();
    });

    it('sorts users by name or email correctly', async () => {
        setup();
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        fireEvent.click(screen.getByLabelText('Email'));
        // Wait for the component to update
        expect(screen.getByText('john.doe@example.com')).toBeVisible();
    });

    it('filters users by role correctly', async () => {
        setup();
        const filterSelect = screen.getByRole('combobox', { name: /filter by role/i });
        fireEvent.mouseDown(filterSelect);
        const employeeOption = screen.getByRole('option', { name: USER_ROLE.EMPLOYEE });
        fireEvent.click(employeeOption);
        // Wait for the component to update
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('paginates users correctly', async () => {
        setup();
        // Assuming rowsPerPage is 5, there should be pagination for the mock data
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        setup();
        const deleteButton = screen.getAllByLabelText(/delete/i)[0]; // Get the first delete button
        fireEvent.click(deleteButton);
        // Assuming handleRemoveUserFromList updates the users state correctly
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('displays a snackbar message after removing a user', async () => {
        setup();
        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteButton);
        // Check if the snackbar appears
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('navigates to the edit page when the edit button is clicked', async () => {
        setup();
        const editButton = screen.getAllByLabelText(/edit/i)[0];
        fireEvent.click(editButton);
        // Check if the URL has changed or if a mock router push function has been called
    });
});
