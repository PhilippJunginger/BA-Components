import { render, screen, fireEvent } from '@testing-library/react';
import { RouterContext } from 'next/router';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- setup
- fireEvent
- wrong import

- variable - 6
- unused const - 2

- 8 von 10 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -20
CleanCode: -40
Testumfang: 75
 */

const mockUsers: UserNoPw[] = [
    {
        email: 'test@test.com',
        name: 'Test User',
        role: USER_ROLE.ADMIN,
    },
    {
        email: 'test2@test.com',
        name: 'Test User 2',
        role: USER_ROLE.EMPLOYEE,
    },
];

const mockRouter = {
    push: jest.fn(),
};

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with user data', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('test@test.com')).toBeInTheDocument();
        expect(screen.getByText('Test User 2')).toBeInTheDocument();
        expect(screen.getByText('test2@test.com')).toBeInTheDocument();
    });

    it('filters users by search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Test User 2');

        expect(screen.getByText('Test User 2')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('sorts users by name', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });

        await userEvent.click(screen.getByLabelText('Name'));
        expect(screen.getByRole('radio', { name: 'Name', checked: true })).toBeInTheDocument();
        expect(screen.getByText('Test User')).toBeTruthy();
        expect(screen.getByText('Test User 2')).toBeTruthy();
    });

    it('sorts users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });

        await userEvent.click(screen.getByLabelText('Email'));
        expect(screen.getByRole('radio', { name: 'Email', checked: true })).toBeInTheDocument();
    });

    it('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const filterSelect = screen.getByRole('combobox', { name: 'Filter by Role' });

        await userEvent.selectOptions(filterSelect, USER_ROLE.EMPLOYEE);

        expect(screen.getByText('Test User 2')).toBeVisible();
        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('paginates users', async () => {
        render(<UserEmployeeListMittel fetchedUsers={[...mockUsers, ...mockUsers]} />);
        const pagination = screen.getByRole('navigation');

        expect(pagination).toBeInTheDocument();
        expect(screen.getAllByRole('listitem')).toHaveLength(2);

        fireEvent.click(screen.getByText('2'));

        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        await userEvent.click(screen.getAllByLabelText('delete')[0]);

        expect(screen.queryByText('Test User')).not.toBeInTheDocument();
    });

    it('navigates to the edit user page', async () => {
        render(
            <RouterContext.Provider value={mockRouter}>
                <UserEmployeeListMittel fetchedUsers={mockUsers} />
            </RouterContext.Provider>,
        );

        await userEvent.click(screen.getAllByLabelText('edit')[0]);

        expect(mockRouter.push).toHaveBeenCalledWith('/edit/Test User');
    });

    it('shows a message when no users match the search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        const searchInput = screen.getByLabelText('Search Users');

        await userEvent.type(searchInput, 'Non Existing User');

        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('shows a message when there are no users available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeVisible();
    });
});
