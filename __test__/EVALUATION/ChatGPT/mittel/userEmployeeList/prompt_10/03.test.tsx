import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*

- unused import
- vairablen - 5

- 8 von 10 notwendigen Testfälen erreicht + 1 Redundanz


Best-Practices: 0
CleanCode: -30
Testumfang: 75
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockedUseRouter = useRouter as jest.Mock;
mockedUseRouter.mockReturnValue({
    push: jest.fn(),
});

const sampleUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Alice Johnson', email: 'alice@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Bob Brown', email: 'bob@example.com', role: USER_ROLE.ADMIN },
    { name: 'Charlie Davis', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Diana Evans', email: 'diana@example.com', role: USER_ROLE.ADMIN },
];

describe('UserEmployeeListMittel Component', () => {
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('should display a list of users', () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        sampleUsers.slice(0, 5).forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('should filter users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Alice');

        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('should sort users by name or email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        const sortByName = screen.getByLabelText('Name');
        const sortByEmail = screen.getByLabelText('Email');

        await user.click(sortByEmail);
        const sortedByEmailUsers = sampleUsers.sort((a, b) => a.email.localeCompare(b.email));
        sortedByEmailUsers.slice(0, 5).forEach((user) => {
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });

        await user.click(sortByName);
        const sortedByNameUsers = sampleUsers.sort((a, b) => a.name.localeCompare(b.name));
        sortedByNameUsers.slice(0, 5).forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
        });
    });

    it('should filter users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        const roleSelect = screen.getByLabelText('Filter by Role');
        await user.click(roleSelect);
        await user.click(screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    it.skip('should paginate users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Diana Evans')).not.toBeInTheDocument();

        const nextPageButton = screen.getByLabelText('Go to page 2');
        await user.click(nextPageButton);

        expect(screen.getByText('Diana Evans')).toBeInTheDocument();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it.skip('should remove a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('should navigate to the user edit page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        const editButton = screen.getByLabelText('edit-Jane Smith');
        await user.click(editButton);

        expect(mockedUseRouter().push).toHaveBeenCalledWith('/edit/Jane Smith');
    });

    it('should display alert when no users match the search criteria', async () => {
        render(<UserEmployeeListMittel fetchedUsers={sampleUsers} />);

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent User');

        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should display alert when no users are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });
});
