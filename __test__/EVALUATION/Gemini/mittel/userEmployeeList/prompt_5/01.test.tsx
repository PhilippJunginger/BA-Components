import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { USER_ROLE, UserNoPw } from '../../../../../../models/user';
import UserEmployeeListMittel from '../../../../../../components/mittel/userEmployeeListMittel';

/*
- fireEvent
- interface
- setup

- variable -6
- setup funktion

- 5 von 10 notwendigem Testumfang erreicht + 1 A + 1 Redundazen


Best-Practices: -30
CleanCode: -35
Testumfang: 45
 */

const testUsers: UserNoPw[] = [
    { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.ADMIN },
    { name: 'Jane Doe', email: 'jane.doe@example.com', role: USER_ROLE.EMPLOYEE },
    { name: 'Jack Doe', email: 'jack.doe@example.com', role: USER_ROLE.EMPLOYEE },
];

const setup = (props?: any) => {
    const utils = render(<UserEmployeeListMittel fetchedUsers={props?.fetchedUsers || testUsers} />);
    return {
        ...utils,
    };
};

describe('UserEmployeeListMittel Component', () => {
    it('renders the component with the user list', () => {
        setup();
        expect(screen.getByText('User List')).toBeInTheDocument();
        testUsers.forEach((user) => {
            expect(screen.getByText(user.name)).toBeInTheDocument();
            expect(screen.getByText(user.email)).toBeInTheDocument();
        });
    });

    it('filters the user list based on search input', async () => {
        setup();
        const searchInput = screen.getByLabelText('Search Users');
        await userEvent.type(searchInput, 'Jane');
        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('sorts the user list by name', async () => {
        setup();
        const [johnDoeListItem, janeDoeListItem, jackDoeListItem] = screen.getAllByRole('listitem');

        expect(johnDoeListItem).toHaveTextContent('John Doe');
        expect(janeDoeListItem).toHaveTextContent('Jane Doe');
        expect(jackDoeListItem).toHaveTextContent('Jack Doe');

        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        await userEvent.click(sortBySelect);

        const nameRadioButton = screen.getByRole('radio', { name: 'Name' });
        await userEvent.click(nameRadioButton);
        expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Jack Doe');
    });

    it('sorts the user list by email', async () => {
        setup();
        const sortBySelect = screen.getByRole('radiogroup', { name: 'Sort by' });
        const emailRadioButton = screen.getByRole('radio', { name: 'Email' });
        await userEvent.click(sortBySelect);
        await userEvent.click(emailRadioButton);

        const [johnDoeListItem, janeDoeListItem, jackDoeListItem] = screen.getAllByRole('listitem');
        expect(jackDoeListItem).toHaveTextContent('Jack Doe');
        expect(johnDoeListItem).toHaveTextContent('John Doe');
        expect(janeDoeListItem).toHaveTextContent('Jane Doe');
    });

    it('filters the user list based on role', async () => {
        setup();
        const roleSelect = screen.getByRole('combobox', { name: 'Filter by Role' });
        await userEvent.selectOptions(roleSelect, USER_ROLE.EMPLOYEE);

        expect(screen.getByText('Jane Doe')).toBeVisible();
        expect(screen.getByText('Jack Doe')).toBeVisible();
        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    });

    it('paginates the user list correctly', async () => {
        setup({ fetchedUsers: [...Array(10)].map((_, i) => ({ ...testUsers[0], name: `User ${i + 1}` })) });

        expect(screen.getByText('User 1')).toBeVisible();
        expect(screen.getByText('User 5')).toBeVisible();
        expect(screen.queryByText('User 6')).not.toBeInTheDocument();

        const nextPageButton = screen.getByRole('button', { name: 'Go to next page' });
        fireEvent.click(nextPageButton);

        expect(screen.queryByText('User 1')).not.toBeInTheDocument();
        expect(screen.getByText('User 6')).toBeVisible();
        expect(screen.getByText('User 10')).toBeVisible();
    });

    it('removes a user from the list', async () => {
        setup();
        const deleteButton = screen.getAllByLabelText(/delete/i)[0];
        fireEvent.click(deleteButton);

        expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
        expect(screen.getByText('User removed successfully!')).toBeVisible();
    });
});
