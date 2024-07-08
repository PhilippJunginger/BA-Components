import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- node access
- fireEvent
- promises
- no assertion

- vairablen - 4
- render Funkton

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -50
CleanCode: -25
Tetumfang: 75
 */

const generateMockUsers = (numUsers: number): UserNoPw[] => {
    const roles = [USER_ROLE.ADMIN, USER_ROLE.EMPLOYEE];
    return Array.from({ length: numUsers }, (_, i) => ({
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: roles[i % 2],
    }));
};

const setup = (users: UserNoPw[] = generateMockUsers(10)) => {
    render(<UserEmployeeListMittel fetchedUsers={users} />);
};

describe('UserEmployeeListMittel Component', () => {
    it('should render user list correctly', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // Default pagination
    });

    it('should filter users based on search term', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'User 3');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('User 3')).toBeVisible();
    });

    it('should sort users by name or email', () => {
        setup();
        const sortBySelect = screen.getByRole('radiogroup');
        // Sort by email
        fireEvent.click(sortBySelect.querySelector('input[value="email"]')!);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('user1@example.com');
        // Sort by name
        fireEvent.click(sortBySelect.querySelector('input[value="name"]')!);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('User 1');
    });

    it('should filter users by role', () => {
        setup();
        const roleSelect = screen.getByLabelText('Filter by Role');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getAllByRole('listitem')).toHaveLength(5); // Assuming 5 admins in the mock data
    });

    it('should paginate users correctly', () => {
        setup();
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeVisible();
        // Click on the second page
        fireEvent.click(screen.getByText('2'));
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('User 6'); // Assuming User 6 is on the second page
    });

    it('should display a message when no users match the search', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('should display a message when there are no users available', () => {
        setup([]);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should handle user deletion', () => {
        setup();
        const firstDeleteButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(firstDeleteButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
        // Check if the user is removed from the list
        expect(screen.queryByText('user1@example.com')).not.toBeInTheDocument();
    });

    it('should navigate to the edit page on edit button click', async () => {
        setup();
        const firstEditButton = screen.getAllByLabelText(/edit/i)[0];
        fireEvent.click(firstEditButton);
        // Assuming your router mock is set up to listen for route changes
        // expect(mockRouter.push).toHaveBeenCalledWith('/edit/User 1');
    });
});
