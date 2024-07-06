import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListLeicht from '../../../../../../components/leicht/userEmployeeListLeicht';

/*
- waitFor

- unused import
- setup
- vairablen - 3
- render Funktion

- 4 von 6 notwendigen Testfälen erreicht + 1 A + 2 Redundanzen


Best-Practices: -10
CleanCode: -30
Testumfang: 50,1
 */

const fetchedUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Smith', email: 'jane.smith@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Customer Joe', email: 'customer.joe@example.com', role: USER_ROLE.CUSTOMER },
];

describe('UserEmployeeListLeicht Component', () => {
    const setup = () => render(<UserEmployeeListLeicht fetchedUsers={fetchedUsers} />);

    it('should render component with initial state', () => {
        setup();

        expect(screen.getByText('User List')).toBeInTheDocument();
        expect(screen.getByLabelText('Search Users')).toHaveValue('');
        expect(screen.getByLabelText('Name')).toBeChecked();
        expect(screen.getByLabelText('Email')).not.toBeChecked();
        expect(screen.getAllByRole('listitem')).toHaveLength(2); // Only ADMIN and EMPLOYEE should be visible
    });

    it('should filter users based on search term', async () => {
        setup();
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Jane');

        await waitFor(() => {
            expect(screen.getByRole('listitem', { name: 'Jane Smith' })).toBeInTheDocument();
            expect(screen.queryByRole('listitem', { name: 'John Doe' })).not.toBeInTheDocument();
        });
    });

    it('should display info alert if no users match search term', async () => {
        setup();
        const user = userEvent.setup();

        const searchInput = screen.getByLabelText('Search Users');
        await user.type(searchInput, 'Nonexistent');

        await waitFor(() => {
            expect(screen.getByText('There are no users matching the current search')).toBeInTheDocument();
        });
    });

    it('should display info alert if there are no users available', () => {
        render(<UserEmployeeListLeicht fetchedUsers={[]} />);

        expect(screen.getByText('There are no users available')).toBeInTheDocument();
    });

    it('should change sort order when radio buttons are clicked', async () => {
        setup();
        const user = userEvent.setup();

        const emailRadio = screen.getByLabelText('Email');
        await user.click(emailRadio);

        expect(screen.getByLabelText('Email')).toBeChecked();
        expect(screen.getByLabelText('Name')).not.toBeChecked();
    });

    it('should remove user from list when delete button is clicked', async () => {
        setup();
        const user = userEvent.setup();

        const deleteButton = screen.getByLabelText('delete-John Doe');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.queryByRole('listitem', { name: 'John Doe' })).not.toBeInTheDocument();
        });
    });

    it('should display user icons correctly', () => {
        setup();

        const johnDoeIcon = within(screen.getByRole('listitem', { name: 'John Doe' })).getByTestId('BadgeIcon');
        const janeSmithIcon = within(screen.getByRole('listitem', { name: 'Jane Smith' })).getByTestId(
            'SupervisorAccountIcon',
        );

        expect(johnDoeIcon).toBeInTheDocument();
        expect(janeSmithIcon).toBeInTheDocument();
    });
});
