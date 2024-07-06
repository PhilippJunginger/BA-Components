import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- userEvent setup
- interface usage
- fireEvent

- variable - 3
- render Funkton
- props spreading

- 4 von 6 notwendigem Testumfang erreicht + 2 A + 2 Redundazen


Best-Practices: -30
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
    const defaultProps = {
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

    it('filters the user list based on search input', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('sorts the user list by name or email', async () => {
        setup();
        const radioByName = screen.getByLabelText('Name');
        const radioByEmail = screen.getByLabelText('Email');

        fireEvent.click(radioByEmail);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('jane.doe@example.com');

        fireEvent.click(radioByName);
        expect(screen.getAllByRole('listitem')[0].textContent).toContain('Jane Doe');
    });

    it('removes a user from the list when delete button is clicked', async () => {
        setup();
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        await userEvent.click(deleteButton);
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('displays a message when there are no users', () => {
        setup({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });

    it('displays a message when no users match the search criteria', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'nonexistentuser');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('only displays admin and employee users', () => {
        setup();
        expect(screen.queryByText('jack.doe@example.com')).not.toBeInTheDocument();
    });
});
