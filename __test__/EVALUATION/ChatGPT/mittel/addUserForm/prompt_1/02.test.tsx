import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical eslint error: userEvent Promise not handled
- critical: beforeEach usw. außerhalb von describe
- critical: kein userEvent.setup()
- critical: Verwendung von fireEvent

- unnötige Verwendung von einem Modul


- clean code: Doppelung - keine variablen erstellt in zweitem test - 2 mal

- 5 von 6 notwendigem Testumfang erreicht + 1 Redundanz


Best-Practices: -40
CleanCode: -20
Testumfang: 75,15
 */

const mockSetUsers = jest.fn();

const initialProps = {
    setUsers: mockSetUsers,
    users: [],
};

describe('AddUserFormMittel', () => {
    it('renders the form fields correctly', () => {
        render(<AddUserFormMittel {...initialProps} />);
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    it('displays password error messages when password criteria are not met', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        const passwordInput = screen.getByLabelText(/password/i);
        await userEvent.type(passwordInput, 'short');
        fireEvent.blur(passwordInput);
        await waitFor(() => {
            expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one uppercase/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one digit/i)).toBeInTheDocument();
            expect(screen.getByText(/needs to contain at least one special character/i)).toBeInTheDocument();
        });
    });

    it('does not submit the form if password criteria are not met', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'short');
        fireEvent.blur(screen.getByLabelText(/password/i));
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));
        await waitFor(() => {
            expect(mockSetUsers).not.toHaveBeenCalled();
        });
    });

    it('displays an error when email is already taken', async () => {
        render(
            <AddUserFormMittel
                {...initialProps}
                users={[
                    {
                        name: 'Existing User',
                        email: 'taken@example.com',
                        role: USER_ROLE.CUSTOMER,
                        password: 'Password123!',
                    },
                ]}
            />,
        );
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'taken@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        fireEvent.blur(screen.getByLabelText(/password/i));
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));
        await waitFor(() => {
            expect(screen.getByText(/es ist ein fehler aufgetreten/i)).toBeInTheDocument();
        });
    });

    it.skip('submits the form successfully when all fields are valid', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        fireEvent.blur(screen.getByLabelText(/password/i));
        await userEvent.click(screen.getByRole('button', { name: /add user/i }));
        await waitFor(() => {
            expect(mockSetUsers).toHaveBeenCalledWith([
                { name: 'John Doe', email: 'john.doe@example.com', role: USER_ROLE.CUSTOMER, password: 'Password123!' },
            ]);
            expect(screen.queryByText(/es ist ein fehler aufgetreten/i)).not.toBeInTheDocument();
        });
    });

    it.skip('displays the department field when the role is not customer', async () => {
        render(<AddUserFormMittel {...initialProps} />);
        await userEvent.type(screen.getByLabelText(/name/i), 'John Doe');
        await userEvent.type(screen.getByLabelText(/email/i), 'john.doe@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'Password123!');
        fireEvent.blur(screen.getByLabelText(/password/i));
        await userEvent.selectOptions(screen.getByLabelText(/role/i), USER_ROLE.ADMIN);
        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });
});
