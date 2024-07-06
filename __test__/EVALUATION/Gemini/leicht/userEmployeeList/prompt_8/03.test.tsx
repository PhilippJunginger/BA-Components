import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup

- variable - 5
- prop spreading

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 1 Redundazen


Best-Practices: -20
CleanCode: -30
Testumfang: 50,1
 */

const testUsers: UserNoPw[] = [
    { email: 'test.user@test.com', name: 'Test User', role: USER_ROLE.EMPLOYEE },
    { email: 'jane.doe@test.com', name: 'Jane Doe', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with user list', () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should sort users by name', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('Jane Doe');
        expect(listItems[1]).toHaveTextContent('Test User');
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0]).toHaveTextContent('jane.doe@test.com');
        expect(listItems[1]).toHaveTextContent('test.user@test.com');
    });

    it('should remove a user from the list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        fireEvent.click(deleteButton);
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('should display a message when no users are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when no users match the search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={testUsers} />);
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
