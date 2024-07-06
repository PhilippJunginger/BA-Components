import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- node access

- typerror
- variable - 2
- setup funktion

- 4 von 6 notwendigem Testumfang erreicht + 3 A + 3 Redundazen


Best-Practices: -20
CleanCode: -20
Testumfang: 41,75
 */

describe('UserEmployeeListLeicht', () => {
    const setup = (props: any = {}) => {
        const defaultProps: any = {
            fetchedUsers: [
                { email: 'test@test.com', name: 'John Doe', role: USER_ROLE.ADMIN },
                { email: 'jane@test.com', name: 'Jane Doe', role: USER_ROLE.EMPLOYEE },
                { email: 'customer@example.com', name: 'Test Customer', role: USER_ROLE.CUSTOMER },
            ],
        };
        return render(<UserEmployeeListLeicht {...defaultProps} {...props} />);
    };

    it('renders the component title', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('renders a list of users', () => {
        setup();
        expect(screen.getAllByRole('listitem')).toHaveLength(2); // Excluding the customer
    });

    it('filters users by name', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('Jane Doe')).toBeVisible();
    });

    it('filters users by email', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'test@test.com');
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
        expect(screen.getByText('John Doe')).toBeVisible();
    });

    it.skip('sorts users by name', async () => {
        setup();
        const [johnDoeItem, janeDoeItem] = screen.getAllByRole('listitem');
        expect(janeDoeItem).toBeInTheDocument();
        expect(johnDoeItem).toBeInTheDocument();

        const sortByControl = screen.getByRole('radio', { name: 'Name' });
        await userEvent.click(sortByControl);

        expect(screen.getAllByRole('listitem')[0]).toEqual(janeDoeItem);
    });

    it('sorts users by email', async () => {
        setup();
        const [johnDoeItem, janeDoeItem] = screen.getAllByRole('listitem');

        const sortByControl = screen.getByRole('radio', { name: 'Email' });
        await userEvent.click(sortByControl);

        expect(screen.getAllByRole('listitem')[0]).toEqual(johnDoeItem);
    });

    it('removes a user from the list', async () => {
        setup();
        const removeButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(removeButton);
        expect(screen.getAllByRole('listitem')).toHaveLength(1);
    });

    it('displays a "no users available" message when there are no users', () => {
        setup({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a "no users matching" message when there are no matching users', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('renders correct icons based on user role', () => {
        setup();
        expect(
            screen.getByText('John Doe').closest('li')?.querySelector('svg[data-testid="BadgeIcon"]'),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Jane Doe').closest('li')?.querySelector('svg[data-testid="SupervisorAccountIcon"]'),
        ).toBeInTheDocument();
    });
});
