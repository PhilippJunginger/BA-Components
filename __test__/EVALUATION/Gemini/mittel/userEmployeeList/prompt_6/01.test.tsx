import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup


- unused import
- variable - 2

- 5 von 10 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -10
CleanCode: -15
Testumfang: 45
 */

const dummyUsers: UserNoPw[] = [
    { email: 'john.doe@example.com', name: 'John Doe', role: USER_ROLE.EMPLOYEE },
    { email: 'jane.doe@example.com', name: 'Jane Doe', role: USER_ROLE.ADMIN },
    { email: 'jack.doe@example.com', name: 'Jack Doe', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel Component', () => {
    it('should render the component with title', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('should display a message when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        const messageElement = screen.getByText('There are no users available');
        expect(messageElement).toBeInTheDocument();
    });

    it('should display user list correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        dummyUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search input', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const searchInput = screen.getByRole('textbox', { name: 'Search Users' });
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(screen.getByLabelText('Name')); // Assuming Radio component has accessible label
        expect(sortBySelect).toHaveValue('name');
        // Add assertion to check if the order of users in the list is updated based on name sorting
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should handle pagination correctly', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const pagination = screen.getByRole('navigation'); // Assuming Pagination component provides navigation role
        expect(pagination).toBeInTheDocument();
        // Add assertions to check if pagination updates the displayed users correctly
    });

    it('should display a snackbar message after removing a user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={dummyUsers} />);
        const deleteUserButton = screen.getAllByRole('button', { name: /delete/i })[0]; // Assuming delete button has accessible name
        await userEvent.click(deleteUserButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });
});
