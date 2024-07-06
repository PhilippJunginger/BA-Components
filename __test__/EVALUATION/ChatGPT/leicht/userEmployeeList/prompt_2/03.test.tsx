import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*

- unused import
- vairablen - 4
- setup

- 5 von 6 notwendigen Testfälen erreicht + 2 Redundanzen


Best-Practices: 0
CleanCode: -30
Testumfang: 66,8
 */

describe('UserEmployeeListLeicht Component', () => {
    const mockUsers = [
        { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
        { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
        { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.CUSTOMER },
    ];

    it('should render the component with the initial state', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Name')).toBeChecked();
        expect(screen.getByLabelText('Email')).not.toBeChecked();
        expect(screen.getByLabelText('Search Users')).toHaveValue('');
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.getByText('bob@example.com')).toBeInTheDocument();
        expect(screen.queryByText('Charlie')).not.toBeInTheDocument(); // CUSTOMER should not be displayed
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Bob');

        expect(searchInput).toHaveValue('Bob');
        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should display alert if no users match the search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'NonExistentUser');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should display alert if there are no fetched users', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should change sort by selection and sort users accordingly', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        expect(emailRadio).toBeChecked();
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Alice');
        expect(screen.getAllByRole('listitem')[1]).toHaveTextContent('Bob');
    });

    it('should remove a user from the list when delete button is clicked', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-Alice');
        await user.click(deleteButton);

        expect(screen.queryByText('Alice')).not.toBeInTheDocument();
        expect(screen.getByText('Bob')).toBeInTheDocument();
    });

    it('should render correct icons for user roles', () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const adminIcon = screen.getAllByTestId('BadgeIcon');
        const employeeIcon = screen.getAllByTestId('SupervisorAccountIcon');

        expect(adminIcon.length).toBe(1); // Only one admin
        expect(employeeIcon.length).toBe(1); // Only one employee
    });
});
