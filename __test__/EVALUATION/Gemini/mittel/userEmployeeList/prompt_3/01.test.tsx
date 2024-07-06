import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter } from 'next/router';
import { ChangeEvent, MouseEvent } from 'react';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- userEvent
- fireEvent
- interface


- unused import
- variable - 4
- setup funktion

- 7 von 10 notwendigem Testumfang erreicht + 2 A + 4 Redundazen


Best-Practices: -40
CleanCode: -30
Testumfang: 50
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUsers: UserNoPw[] = [
    {
        name: 'John Doe',
        email: 'john.doe@example.com',
        role: USER_ROLE.ADMIN,
    },
    {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
    {
        name: 'Jack Doe',
        email: 'jack.doe@example.com',
        role: USER_ROLE.EMPLOYEE,
    },
];

const setup = (props?: any) => {
    const defaultProps = {
        fetchedUsers: mockUsers,
    };

    const mergedProps = { ...defaultProps, ...props };

    render(<UserEmployeeListMittel {...mergedProps} />);
};

describe('UserEmployeeListMittel Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders without crashing', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it.skip('renders the correct number of users', () => {
        setup();
        expect(screen.getAllByRole('listitem')).toHaveLength(mockUsers.length);
    });

    it('renders user information correctly', () => {
        setup();
        mockUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it.skip('filters users based on search term', () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'john' } });
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it.skip('sorts users by name', () => {
        setup();
        const sortSelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        fireEvent.click(sortSelect.querySelector('input[value="name"]') as HTMLInputElement);
        const userNames = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[0].trim());
        expect(userNames).toEqual(['Jack Doe', 'Jane Doe', 'John Doe']);
    });

    it.skip('sorts users by email', () => {
        setup();
        const sortSelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        fireEvent.click(sortSelect.querySelector('input[value="email"]') as HTMLInputElement);
        const userEmails = screen.getAllByRole('listitem').map((item) => item.textContent?.split('\n')[1].trim());
        expect(userEmails).toEqual(['jack.doe@example.com', 'jane.doe@example.com', 'john.doe@example.com']);
    });

    it.skip('filters users by role', () => {
        setup();
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.EMPLOYEE } } as ChangeEvent<HTMLSelectElement>);
        expect(screen.getAllByRole('listitem')).toHaveLength(2);
    });

    it.skip('paginates users correctly', () => {
        setup();
        const pagination = screen.getByRole('navigation');
        expect(pagination).toBeInTheDocument();
        // Assuming rowsPerPage is 5, there should be only one page
        expect(screen.queryByLabelText('Go to next page')).not.toBeInTheDocument();
    });

    it.skip('removes a user from the list', () => {
        setup();
        const firstDeleteButton = screen.getAllByLabelText(/delete/i)[0] as HTMLButtonElement;
        fireEvent.click(firstDeleteButton);
        expect(screen.getAllByRole('listitem')).toHaveLength(mockUsers.length - 1);
    });

    it('displays a snackbar message after removing a user', () => {
        setup();
        const firstDeleteButton = screen.getAllByLabelText(/delete/i)[0] as HTMLButtonElement;
        fireEvent.click(firstDeleteButton);
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });

    it.skip('navigates to the edit user page', async () => {
        const pushMock = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            push: pushMock,
        });
        setup();
        const firstEditButton = screen.getAllByLabelText(/edit/i)[0] as HTMLButtonElement;
        fireEvent.click(firstEditButton);
        expect(pushMock).toHaveBeenCalledWith('/edit/John Doe');
    });

    it('shows "no users available" when there are no users', () => {
        setup({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('shows "no users matching" when there are no search results', () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        fireEvent.change(searchInput, { target: { value: 'nonexistent' } });
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });
});
