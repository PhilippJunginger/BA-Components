import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- fireEvent
- import of non importable
- node access

- variable - 3
- setup funkton
- props spreading

- 4 von 6 notwendigem Testumfang erreicht + 1 A + 2 Redundazen


Best-Practices: -40
CleanCode: -25
Testumfang: 50,1
 */

const testUsers = [
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
        role: USER_ROLE.CUSTOMER,
    },
];

const setup = (props: any = {}) => {
    const defaultProps: any = {
        fetchedUsers: testUsers,
    };
    return render(<UserEmployeeListLeicht {...defaultProps} {...props} />);
};

describe('UserEmployeeListLeicht Component', () => {
    it('renders the component with user list', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    });

    it('filters the user list based on search term', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        expect(screen.getByText('john.doe@example.com')).toBeVisible();
        expect(screen.queryByText('jane.doe@example.com')).not.toBeInTheDocument();
    });

    it('sorts the user list by name or email', async () => {
        setup();
        const nameRadio = screen.getByLabelText('Name');
        const emailRadio = screen.getByLabelText('Email');

        fireEvent.click(emailRadio);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('jane.doe@example.com');

        fireEvent.click(nameRadio);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('Jane Doe');
    });

    it.skip('removes a user from the list', async () => {
        setup();
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('shows a message when no users are available', () => {
        setup({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('shows a message when no users match the search', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it.skip('displays the correct icon based on user role', () => {
        setup();
        expect(screen.getByText('John Doe').parentElement?.querySelector('svg')).toHaveAttribute(
            'data-testid',
            'BadgeIcon',
        );
        expect(screen.getByText('Jane Doe').parentElement?.querySelector('svg')).toHaveAttribute(
            'data-testid',
            'SupervisorAccountIcon',
        );
    });
});
