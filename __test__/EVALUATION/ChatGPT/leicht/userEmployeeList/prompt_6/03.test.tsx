import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- render in beforeEach

- vairablen - 3
- unused import


- 5 von 6 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: -10
CleanCode: -20
Testumfang: 75,15
 */

const mockUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.ADMIN },
    { name: 'Alice Johnson', email: 'alice.johnson@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListLeicht Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);
    });

    it('should display the correct initial sort option', () => {
        const radioName = screen.getByLabelText('Name');
        expect(radioName).toBeChecked();
    });

    it('should update search term and filter users correctly', async () => {
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'Jane');
        expect(searchInput).toHaveValue('Jane');

        expect(screen.getByLabelText('Jane Smith')).toBeInTheDocument();
        expect(screen.queryByLabelText('John Doe')).not.toBeInTheDocument();
    });

    it('should display a message when no users match the search term', async () => {
        const searchInput = screen.getByLabelText('Search Users');

        await user.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should sort users by email when selected', async () => {
        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        const sortedUsers = screen.getAllByRole('listitem');
        expect(sortedUsers[0]).toHaveTextContent('Alice Johnson');
        expect(sortedUsers[1]).toHaveTextContent('Jane Smith');
        expect(sortedUsers[2]).toHaveTextContent('John Doe');
    });

    it('should remove a user from the list when delete button is clicked', async () => {
        const deleteButton = screen.getByLabelText('delete-Jane Smith');
        await user.click(deleteButton);

        expect(screen.queryByLabelText('Jane Smith')).not.toBeInTheDocument();
    });

    it('should display an alert when there are no users available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
