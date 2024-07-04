import { render, screen } from '@testing-library/react';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import userEvent from '@testing-library/user-event';
import { USER_ROLE } from '../../../../../../models/user';

/*

- missing major logic
- userEvent.setup

- doppelung keine variable - 3
- TypeError

- 3 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -40
CleanCode: -20
Testumfang: 41,75
 */

describe('AddUserFormMittel', () => {
    test('displays password validation errors when invalid password is entered', async () => {
        render(<AddUserFormMittel setUsers={() => {}} users={[]} />);

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'invalid'); // Invalid password

        const errorHelperText = screen.getByText(/Password needs to be 8 characters long/i);
        expect(errorHelperText).toBeInTheDocument();
    });

    test('selects the correct role', async () => {
        render(<AddUserFormMittel setUsers={() => {}} users={[]} />);

        const selectLabel = screen.getByText('Role');
        await userEvent.click(selectLabel);

        const adminOption = screen.getByText('ADMIN');
        await userEvent.click(adminOption);

        expect(screen.getByLabelText('Role')).toHaveValue('ADMIN');
    });

    test('shows error when email is already taken', async () => {
        const existingUsers = [{ name: 'Existing', email: 'test@example.com', role: USER_ROLE.CUSTOMER }];
        render(<AddUserFormMittel setUsers={() => {}} users={existingUsers} />);

        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(emailInput, 'test@example.com'); // Duplicate email

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await userEvent.click(submitButton);

        const errorAlert = screen.getByText(/Es ist ein Fehler aufgetreten!/i);
        expect(errorAlert).toBeInTheDocument();
    });

    test('adds a new user with valid data', async () => {
        const setUsersMock = jest.fn();
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            json: () => Promise.resolve({}),
            status: 200,
        } as Response);

        render(<AddUserFormMittel setUsers={setUsersMock} users={[]} />);

        // Fill in all fields with valid data
        // ...

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await userEvent.click(submitButton);

        // Assertions
        expect(fetchMock).toHaveBeenCalledWith('http://localhost:8080/user', {
            // ...
        });
        expect(setUsersMock).toHaveBeenCalledWith([
            expect.objectContaining({
                // ... the new user data
            }),
        ]);

        // Additional checks for form reset, etc.
    });
});
