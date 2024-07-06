import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- fireEvent

- variable - 2

- 4 von 6 notwendigem Testumfang erreicht + 3 A + 2 Redundazen


Best-Practices: -30
CleanCode: -10
Testumfang: 50,1
 */

const testUsers: UserNoPw[] = [
    { email: 'test.user@test.com', name: 'Test User', role: USER_ROLE.EMPLOYEE },
    { email: 'example.user@example.com', name: 'Example User', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with the correct title', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const titleElement = screen.getByText('User List');
        expect(titleElement).toBeInTheDocument();
    });

    it('should display a "no users" message when the fetchedUsers array is empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        const messageElement = screen.getByText('There are no users available');
        expect(messageElement).toBeInTheDocument();
    });

    it('should display a list of users when the fetchedUsers array is not empty', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const userElements = screen.getAllByRole('listitem');
        expect(userElements).toHaveLength(testUsers.length);
    });

    it('should filter the list of users based on the search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Test' } });
        const userElements = screen.getAllByRole('listitem');
        expect(userElements).toHaveLength(1);
    });

    it('should sort the list of users by name', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadioButton = screen.getByLabelText('Name');
        fireEvent.click(nameRadioButton);
        const userElements = screen.getAllByRole('listitem');
        expect(userElements[0].textContent).toContain('Example User');
        expect(userElements[1].textContent).toContain('Test User');
    });

    it('should sort the list of users by email', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadioButton = screen.getByLabelText('Email');
        fireEvent.click(emailRadioButton);
        const userElements = screen.getAllByRole('listitem');
        expect(userElements[0].textContent).toContain('example.user@example.com');
        expect(userElements[1].textContent).toContain('test.user@test.com');
    });

    it('should remove a user from the list when the delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        const userElements = screen.getAllByRole('listitem');
        expect(userElements).toHaveLength(testUsers.length - 1);
    });

    it.skip('should display the correct icon for each user role', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const adminIcon = screen.getByTitle('Badge'); // Assuming BadgeIcon has title 'Badge'
        const employeeIcon = screen.getByTitle('Supervisor Account'); // Assuming SupervisorAccountIcon has title 'Supervisor Account'
        expect(adminIcon).toBeInTheDocument();
        expect(employeeIcon).toBeInTheDocument();
    });

    it('should display a message when no users match the search term', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'Nonexistent User' } });
        const messageElement = screen.getByText('There are no users matching the current search');
        expect(messageElement).toBeInTheDocument();
    });
});
