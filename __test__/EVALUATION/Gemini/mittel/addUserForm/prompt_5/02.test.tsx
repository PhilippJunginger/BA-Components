import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from './AddUserFormMittel';
import { USER_ROLE } from '../../models/user';

/*
- promises not handled
- missing major logic

- doppelung keine variable - 1
- unnecessary waitFor

- 3 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -50
CleanCode: -10
Testumfang: 50,1
 */

describe('AddUserFormMittel', () => {
    // ... (previous tests)

    test('shows error message for invalid password', async () => {
        // ...
        await userEvent.type(screen.getByLabelText('Password'), 'weakpassword');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeInTheDocument();
        // ... assert other error messages
    });

    test('shows error message for duplicate email', async () => {
        const users = [{ name: 'Existing User', email: 'test@example.com', role: USER_ROLE.CUSTOMER }];
        render(<AddUserFormMittel setUsers={() => {}} users={users} />);

        // ... (fill form with 'test@example.com' email)
        await userEvent.click(screen.getByText('Add User'));

        await waitFor(() => {
            expect(screen.getByText('Es ist ein Fehler aufgetreten!')).toBeInTheDocument();
        });
    });

    test('renders department field for non-customer roles', async () => {
        // ...
        await userEvent.selectOptions(screen.getByLabelText('Role'), USER_ROLE.EMPLOYEE);

        expect(screen.getByLabelText('Department')).toBeInTheDocument();
    });
});
