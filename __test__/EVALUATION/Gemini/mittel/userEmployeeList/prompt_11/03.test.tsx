import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- fireEvent
- no assertion
- props interface usage

- vairablen - 4
- render Funkton
- prop spreading

- 8 von 10 notwendigen Testfälen erreicht + 1 A + 2 Redundanz


Best-Practices: -40
CleanCode: -30
Tetumfang: 70
 */

const generateTestUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
        role: roles[i % 2],
    }));
};

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        fetchedUsers: generateTestUsers(10),
    };
    return render(<UserEmployeeListMittel {...defaultProps} {...props} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('renders without crashing', () => {
        renderComponent();
    });

    it('displays the correct number of users initially', () => {
        renderComponent();
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(5); // Default rowsPerPage is 5
    });

    it('filters users based on search term', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Test User 3');
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(1);
    });

    it('sorts users by name', async () => {
        renderComponent();
        const nameRadioButton = screen.getByLabelText('Name');
        await userEvent.click(nameRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0].textContent).toContain('Test User 1');
    });

    it('sorts users by email', async () => {
        renderComponent();
        const emailRadioButton = screen.getByLabelText('Email');
        await userEvent.click(emailRadioButton);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems[0].textContent).toContain('test1@example.com');
    });

    it('filters users by role', async () => {
        renderComponent();
        const filterSelect = screen.getByLabelText('Filter by Role');
        await userEvent.selectOptions(filterSelect, USER_ROLE.ADMIN);
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(3); // Assuming 5 admin users out of 10
    });

    it('paginates users correctly', async () => {
        renderComponent();
        const pagination = screen.getByRole('pagination');
        const pageButtons = screen.getAllByRole('button', { name: /Go to page \d/ });
        expect(pageButtons).toHaveLength(2); // 10 users / 5 per page = 2 pages
        fireEvent.click(pageButtons[1]);
        expect(pagination).toHaveAttribute('aria-current', 'true');
    });

    it('displays a message when no users match the search', async () => {
        renderComponent();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('displays a message when there are no users available', () => {
        renderComponent({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('removes a user from the list', async () => {
        renderComponent();
        const deleteUserButton = screen.getAllByLabelText(/delete/i)[0];
        await userEvent.click(deleteUserButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
        const userItems = screen.getAllByRole('listitem');
        expect(userItems).toHaveLength(4);
    });

    it('navigates to the user edit page', async () => {
        const routerPushMock = jest.fn();
        jest.mock('next/router', () => ({
            useRouter: () => ({
                push: routerPushMock,
            }),
        }));
        renderComponent();
        const editUserButton = screen.getAllByLabelText(/edit/i)[0];
        await userEvent.click(editUserButton);
        expect(routerPushMock).toHaveBeenCalledWith('/edit/Test User 1');
    });
});
