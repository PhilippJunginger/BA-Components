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

    const mergedProps = { ...defaultProps, ...props };
    render(<UserEmployeeListLeicht {...mergedProps} />);
};

describe('UserEmployeeListLeicht Component', () => {
    it('renders the component with the correct title', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
    });

    it('renders the correct number of list items', () => {
        setup();
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(2); // Only admin and employee should be rendered
    });

    it('filters the list items based on search input', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'john');
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
    });

    it('sorts the list items by name', async () => {
        setup();
        const nameRadio = screen.getByLabelText('Name');
        fireEvent.click(nameRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0].textContent).toContain('Jane Doe');
        expect(listItems[1].textContent).toContain('John Doe');
    });

    it('sorts the list items by email', async () => {
        setup();
        const emailRadio = screen.getByLabelText('Email');
        fireEvent.click(emailRadio);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems[0].textContent).toContain('jane.doe@example.com');
        expect(listItems[1].textContent).toContain('john.doe@example.com');
    });

    it('removes a user from the list when the delete button is clicked', async () => {
        setup();
        const deleteButton = screen.getAllByRole('button', { name: /delete/i })[0];
        fireEvent.click(deleteButton);
        const listItems = screen.getAllByRole('listitem');
        expect(listItems).toHaveLength(1);
    });

    it('displays a message when there are no users matching the search', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'xyz');
        expect(screen.getByText('There are no users matching the current search')).toBeVisible();
    });

    it('displays a message when there are no users available', () => {
        setup({ fetchedUsers: [] });
        expect(screen.getByText('There are no users available')).toBeVisible();
    });
});
