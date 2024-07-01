import { render, screen } from '@testing-library/react';
import UserEmployeeListLeicht from '../../components/leicht/userEmployeeListLeicht';
import '@testing-library/jest-dom';
import { User, USER_ROLE } from '../../models/user';
import userEvent from '@testing-library/user-event';

describe('Testing UserEmployeeListLeicht', () => {
    const user = userEvent.setup();
    const mockUsers: User[] = [
        { name: '1', role: USER_ROLE.EMPLOYEE, password: '124', email: '2@email.com' },
        { name: '2', role: USER_ROLE.ADMIN, password: '124', email: '1@email.com' },
    ];

    it('should show alert, if no fetchedUsers are available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should show alert, if fetchedUsers only contains customers', () => {
        render(
            <UserEmployeeListLeicht
                fetchedUsers={[
                    { name: 'Customer', role: USER_ROLE.CUSTOMER, password: '124', email: 'test@email.com' },
                ]}
            />,
        );

        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should sort users by email', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        const sortedListItems = screen.getAllByRole('listitem');
        expect(sortedListItems[0]).toHaveTextContent(mockUsers[0].name);
        await user.click(screen.getByRole('radio', { name: 'Email' }));
        expect(sortedListItems[0]).toHaveTextContent(mockUsers[1].name);
    });

    it('should filter by search', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        expect(screen.getAllByRole('listitem').length).toEqual(2);
        await user.type(screen.getByRole('textbox', { name: 'Search Users' }), '1@');
        expect(screen.getAllByRole('listitem').length).toEqual(1);
    });

    it('should show alert, if search finds nothing', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        await user.type(screen.getByRole('textbox', { name: 'Search Users' }), 'Y');
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
    });

    it('should delete user from list', async () => {
        render(<UserEmployeeListLeicht fetchedUsers={mockUsers} />);

        await user.click(screen.getByRole('button', { name: `delete-${mockUsers[0].name}` }));
        expect(screen.queryByRole('listitem', { name: mockUsers[0].name })).not.toBeInTheDocument();
    });
});
