import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- no assertion
- fireEvent
- interface

- typeerror
- render Funktion
- variable - 5
- prop spreading

- 7 von 10 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -40
Testumfang: 60
 */

const testUsers: UserNoPw[] = [
    { email: 'test.user@test.com', name: 'Test User', role: USER_ROLE.EMPLOYEE },
    { email: 'example.user@example.com', name: 'Example User', role: USER_ROLE.ADMIN },
    { email: 'another.user@another.com', name: 'Another User', role: USER_ROLE.EMPLOYEE },
];

const renderComponent = (props?: any) => {
    const defaultProps = {
        fetchedUsers: testUsers,
    };
    return render(<UserEmployeeListMittel {...defaultProps} {...props} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with user list', () => {
        renderComponent();
        expect(screen.getByText('User List')).toBeInTheDocument();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters the user list based on search input', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Example');
        expect(screen.getByText('Example User')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.queryByText('Another User')).not.toBeInTheDocument();
    });

    it('sorts the user list by name or email', async () => {
        renderComponent();
        const sortBySelect = screen.getByRole('radiogroup', { name: /sort by/i });
        const nameRadioButton = screen.getByLabelText('Name');
        const emailRadioButton = screen.getByLabelText('Email');

        fireEvent.click(emailRadioButton);
        expect(sortBySelect).toHaveValue('email');
        expect(screen.getByText('another.user@another.com')).precede(screen.getByText('example.user@example.com'));

        fireEvent.click(nameRadioButton);
        expect(sortBySelect).toHaveValue('name');
        expect(screen.getByText('Another User')).precede(screen.getByText('Example User'));
    });

    it('filters the user list by role', async () => {
        renderComponent();
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(roleSelect, USER_ROLE.ADMIN);

        expect(screen.getByText('Example User')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.queryByText('Another User')).not.toBeInTheDocument();
    });

    it('paginates the user list correctly', async () => {
        renderComponent();
        const pagination = screen.getByRole('navigation'); // Assuming Pagination component has role="navigation"
        // Assuming 5 items per page
        expect(pagination).toBeInTheDocument();
        expect(screen.queryByText('Test User')).toBeVisible();
        expect(screen.queryByText('Example User')).toBeVisible();
        expect(screen.queryByText('Another User')).not.toBeVisible();

        // Navigate to the next page
        const nextPageButton = screen.getByLabelText('Go to next page');
        fireEvent.click(nextPageButton);

        // Verify the third user is now visible
        expect(screen.queryByText('Another User')).toBeVisible();
    });

    it('removes a user from the list', async () => {
        renderComponent();
        const deleteUserButton = screen.getAllByLabelText(/delete-/i)[0];
        fireEvent.click(deleteUserButton);

        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it('navigates to the user edit page', async () => {
        renderComponent();
        const editUserButton = screen.getAllByLabelText(/edit-/i)[0];
        fireEvent.click(editUserButton);

        // Assuming the router.push function is mocked or otherwise tested
    });

    it('displays a message when no users are available', () => {
        renderComponent({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('displays a message when no users match the search criteria', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
