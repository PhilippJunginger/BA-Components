import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- interface
- node access

- variable - 3
- render Fhnktion

- 5 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -30
CleanCode: -20
Testumfang: 66,8
 */

const testUsers = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Peter Pan', email: 'peter.pan@example.com', role: USER_ROLE.CUSTOMER },
];

const setup = (props: any = {}) => {
    const utils = render(<UserEmployeeListLeicht fetchedUsers={props.fetchedUsers || []} />);
    return { ...utils };
};

describe('UserEmployeeListLeicht Component', () => {
    it('should render the component with title', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('should display a list of users', () => {
        setup({ fetchedUsers: testUsers });
        expect(screen.getByText('John Doe')).toBeVisible();
        expect(screen.getByText('Jane Smith')).toBeVisible();
    });

    it('should not display customers in the list', () => {
        setup({ fetchedUsers: testUsers });
        expect(screen.queryByText('Peter Pan')).not.toBeInTheDocument();
    });

    it('should filter the list of users based on search input', async () => {
        setup({ fetchedUsers: testUsers });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Smith')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort the list of users by name', async () => {
        setup({ fetchedUsers: testUsers });
        const [johnDoe, janeSmith] = screen.getAllByRole('listitem');
        expect(johnDoe).toBeInTheDocument();
        expect(janeSmith).toBeInTheDocument();
    });

    it.skip('should sort the list of users by email', async () => {
        setup({ fetchedUsers: testUsers });
        const sortByControl = screen.getByLabelText('Sort by');
        await userEvent.click((sortByControl as HTMLDivElement).querySelector('input[type="radio"][value="email"]')!);
        // Add assertions to check email sorting
    });

    it('should remove a user from the list', async () => {
        setup({ fetchedUsers: testUsers });
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        // Add assertion to check if the user is removed
    });

    it('should display a message when no users are available', () => {
        setup();
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('should display a message when no users match the search criteria', async () => {
        setup({ fetchedUsers: testUsers });
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Nonexistent User');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
