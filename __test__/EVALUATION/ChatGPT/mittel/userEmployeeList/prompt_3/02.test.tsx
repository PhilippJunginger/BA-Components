import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- promises
- setup

- unused import
- vairablen - 4
- unnecessary waitFor

- 8 von 10 notwendigen Testfälen erreicht + 2 Redundanz


Best-Practices: -20
CleanCode: -30
Testumfang: 70
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const mockUsers: UserNoPw[] = [
    { name: 'Alice', email: 'alice@example.com', role: USER_ROLE.ADMIN },
    { name: 'Bob', email: 'bob@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Charlie', email: 'charlie@example.com', role: USER_ROLE.EMPLOYEE },
];

describe('UserEmployeeListMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.skip('renders the component with initial props', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter by Role')).toBeInTheDocument();
    });

    it('displays users correctly', () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        mockUsers.forEach((user) => {
            expect(screen.getByLabelText(user.name)).toBeInTheDocument();
        });
    });

    it('filters users based on search term', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'Alice');
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
    });

    it('sorts users by name and email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('Email'));
        const sortedByEmail = mockUsers.sort((a, b) => a.email.localeCompare(b.email));
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent(sortedByEmail[0].name);
    });

    it.skip('filters users by role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.selectOptions(screen.getByLabelText('Filter by Role'), USER_ROLE.ADMIN);
        expect(screen.getByLabelText('Alice')).toBeInTheDocument();
        expect(screen.queryByLabelText('Bob')).not.toBeInTheDocument();
    });

    it('removes a user from the list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('delete-Alice'));
        await waitFor(() => {
            expect(screen.queryByLabelText('Alice')).not.toBeInTheDocument();
        });
        expect(screen.getByText('User removed successfully!')).toBeInTheDocument();
    });

    it('navigates to user edit page on edit button click', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.click(screen.getByLabelText('edit-Alice'));
        expect(mockPush).toHaveBeenCalledWith('/edit/Alice');
    });

    it.skip('displays pagination and navigates between pages', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        expect(screen.getByRole('navigation')).toBeInTheDocument();
        await userEvent.click(screen.getByLabelText('Go to next page'));
        expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'true');
    });

    it('displays no users available message when no users are fetched', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('displays no matching users message when search term does not match any user', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);
        await userEvent.type(screen.getByLabelText('Search Users'), 'NonExistentUser');
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });
});
