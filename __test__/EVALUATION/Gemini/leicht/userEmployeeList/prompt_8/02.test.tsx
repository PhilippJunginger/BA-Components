import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- interface usage

- variable - 5
- render funktion
- prop spreading

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -20
CleanCode: -35
Testumfang: 50,1
 */

const testUsers = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
];

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        fetchedUsers: testUsers,
    };

    return render(<UserEmployeeListLeicht {...defaultProps} {...props} />);
};

describe('<UserEmployeeListLeicht />', () => {
    it('should render the user list with correct title', () => {
        renderComponent();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        renderComponent();
        expect(screen.getByText('Alice')).toBeVisible();
        expect(screen.getByText('bob@example.com')).toBeVisible();
    });

    it('should filter the user list based on search input', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'bob');
        expect(screen.getByText('Bob')).toBeVisible();
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it.skip('should sort the user list by name', async () => {
        renderComponent();
        const nameRadioButton = screen.getByLabelText('Name');
        fireEvent.click(nameRadioButton);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
        expect(userNames).toEqual(['Alice', 'Bob']);
    });

    it.skip('should sort the user list by email', async () => {
        renderComponent();
        const emailRadioButton = screen.getByLabelText('Email');
        fireEvent.click(emailRadioButton);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.trim());
        expect(userEmails).toEqual(['alice@example.com', 'bob@example.com']);
    });

    it('should remove a user from the list when the delete button is clicked', async () => {
        renderComponent();
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
    });

    it('should display a message when there are no users available', () => {
        renderComponent({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when there are no users matching the search', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
