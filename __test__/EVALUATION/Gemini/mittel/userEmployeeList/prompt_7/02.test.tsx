import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion
- fireEvent
- interface

- render Funktion
- variable - 4
- prop spreading
- enum
- mock user Funktion inside render Fubkton

- 7 von 10 notwendigem Testumfang erreicht + 3 A + 2 Redundazen


Best-Practices: -40
CleanCode: -40
Testumfang: 60
 */

const generateMockUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % 2],
    }));
};

const setup = (props: any = {}) => {
    const mockUsers: UserNoPw[] = generateMockUsers(10);
    const defaultProps = {
        fetchedUsers: mockUsers,
    };
    return render(<UserEmployeeListMittel {...defaultProps} {...props} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with the correct title', () => {
        setup();
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('renders the correct number of user list items', () => {
        setup();
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements).toHaveLength(5); // Default pagination
    });

    it('filters users based on search input', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'User 3');
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements).toHaveLength(1);
    });

    it('sorts users by name', async () => {
        setup();
        const nameRadioButton = screen.getByLabelText('Name');
        fireEvent.click(nameRadioButton);
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements[0].textContent).toContain('User 1');
    });

    it('sorts users by email', async () => {
        setup();
        const emailRadioButton = screen.getByLabelText('Email');
        fireEvent.click(emailRadioButton);
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements[0].textContent).toContain('user1@example.com');
    });

    it('filters users by role', async () => {
        setup();
        const roleSelect = screen.getByRole('button', { name: 'Filter by Role' });
        fireEvent.mouseDown(roleSelect);
        const employeeOption = screen.getByRole('option', { name: 'EMPLOYEE' });
        fireEvent.click(employeeOption);
        const listItemElements = screen.getAllByRole('listitem');
        listItemElements.forEach((item) => {
            expect(item.textContent).toContain('EMPLOYEE');
        });
    });

    it('paginates through the user list', async () => {
        setup();
        const paginationButton = screen.getByRole('button', { name: 'Go to next page' });
        fireEvent.click(paginationButton);
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements[0].textContent).toContain('User 6');
    });

    it('displays a message when no users match the search criteria', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        const messageElement = screen.getByText('There are no users matching the current search');
        expect(messageElement).toBeVisible();
    });

    it('displays a message when there are no users available', () => {
        setup({ fetchedUsers: [] });
        const messageElement = screen.getByText('There are no users available');
        expect(messageElement).toBeVisible();
    });

    it('removes a user from the list', async () => {
        setup();
        const firstDeleteButton = screen.getAllByLabelText('delete')[0];
        fireEvent.click(firstDeleteButton);
        const listItemElements = screen.getAllByRole('listitem');
        expect(listItemElements).toHaveLength(4);
    });

    it('navigates to the edit user page', async () => {
        setup();
        const firstEditButton = screen.getAllByLabelText('edit')[0];
        fireEvent.click(firstEditButton);
        // Add assertion to check if the router has pushed the correct route
    });

    it('displays a snackbar message after removing a user', async () => {
        setup();
        const firstDeleteButton = screen.getAllByLabelText('delete')[0];
        fireEvent.click(firstDeleteButton);
        const snackbarMessage = await screen.findByText('User removed successfully!');
        expect(snackbarMessage).toBeVisible();
    });
});
