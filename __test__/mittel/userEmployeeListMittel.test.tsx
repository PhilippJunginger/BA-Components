import { render, screen, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { User, USER_ROLE } from '../../models/user';
import userEvent from '@testing-library/user-event';
import UserEmployeeListMittel from '../../components/mittel/userEmployeeListMittel';
import { useRouter } from 'next/router';

jest.mock('next/router', () => ({
    ...jest.requireActual('next/router'),
    useRouter: jest.fn(),
}));

describe('Testing UserEmployeeListMittel', () => {
    const user = userEvent.setup();
    const mockUsers: User[] = [
        { name: '1', role: USER_ROLE.EMPLOYEE, password: '124', email: '2@email.com' },
        { name: '2', role: USER_ROLE.ADMIN, password: '124', email: '1@email.com' },
    ];
    const mockRouter = {
        pathname: '/',
        push: jest.fn(),
        query: {
            shouldRoute: false,
        },
    };

    beforeEach(() => {
        jest.resetAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('should show alert, if no fetchedUsers are available', () => {
        render(<UserEmployeeListMittel fetchedUsers={[]} />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should show alert, if fetchedUsers only contains customers', () => {
        render(
            <UserEmployeeListMittel
                fetchedUsers={[
                    { name: 'Customer', role: USER_ROLE.CUSTOMER, password: '124', email: 'test@email.com' },
                ]}
            />,
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        const sortedListItems = screen.getAllByRole('listitem');
        expect(sortedListItems[0]).toHaveTextContent(mockUsers[0].name);
        await user.click(screen.getByRole('radio', { name: 'Email' }));
        expect(sortedListItems[0]).toHaveTextContent(mockUsers[1].name);
    });

    it('should filter by search', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        expect(screen.getByRole('listitem', { name: mockUsers[0].name })).toBeInTheDocument();
        await user.type(screen.getByRole('textbox', { name: 'Search Users' }), '1@');
        expect(screen.queryByRole('listitem', { name: mockUsers[0].name })).not.toBeInTheDocument();
    });

    it('should show alert, if search finds nothing', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        await user.type(screen.getByRole('textbox', { name: 'Search Users' }), 'Y');
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should show alert after filtering for role', async () => {
        render(<UserEmployeeListMittel fetchedUsers={[mockUsers[0]]} />);

        await user.click(screen.getByRole('combobox'));
        await user.selectOptions(screen.getByRole('listbox'), screen.getByRole('option', { name: USER_ROLE.ADMIN }));

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should delete user from list', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        await user.click(screen.getByRole('button', { name: `delete-${mockUsers[0].name}` }));
        expect(screen.queryByRole('listitem', { name: mockUsers[0].name })).not.toBeInTheDocument();
    });

    it('should route to edit user page', async () => {
        render(<UserEmployeeListMittel fetchedUsers={mockUsers} />);

        await user.click(screen.getByRole('button', { name: `edit-${mockUsers[0].name}` }));
        expect(mockRouter.push).toHaveBeenCalledWith(`/edit/${mockUsers[0].name}`);
    });

    it('should show users of next page', async () => {
        render(
            <UserEmployeeListMittel
                fetchedUsers={[
                    ...mockUsers,
                    { name: '3', role: USER_ROLE.ADMIN, password: '124', email: '3@email.com' },
                    { name: '4', role: USER_ROLE.ADMIN, password: '124', email: '4@email.com' },
                    { name: '5', role: USER_ROLE.ADMIN, password: '124', email: '5@email.com' },
                    { name: '6', role: USER_ROLE.ADMIN, password: '124', email: '6@email.com' },
                ]}
            />,
        );

        expect(screen.queryByRole('listitem', { name: '6' })).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'Go to page 2' }));
        expect(screen.getByRole('listitem', { name: '6' })).toBeInTheDocument();
    });

    it('should not show button for next page', async () => {
        render(
            <UserEmployeeListMittel
                fetchedUsers={[
                    ...mockUsers,
                    { name: '3', role: USER_ROLE.ADMIN, password: '124', email: '3@email.com' },
                    { name: '4', role: USER_ROLE.ADMIN, password: '124', email: '4@email.com' },
                    { name: '5', role: USER_ROLE.ADMIN, password: '124', email: '5@email.com' },
                ]}
            />,
        );

        expect(screen.queryByRole('button', { name: 'Go to page 2' })).not.toBeInTheDocument();
    });
});
