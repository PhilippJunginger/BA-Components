import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- critical: keine Verwendung von userEvent.setup()
- critical: promise not handled
- critical: Verwendung von fireEvent
- critical: too many assertions in waitFor

- komplizierte initialProps
- clean code: Doppelung - keine variablen erstellt
- unnecessary await findByText - 5 mal



- 5 von 6 notwendigen Testumfang erreicht + 2 Redundanz


Best-Practices: -40
CleanCode: -35
Testumfang: 66,8
*/

describe('AddUserFormMittel', () => {
    const mockSetUsers = jest.fn();
    const initialProps = {
        users: [],
        setUsers: mockSetUsers,
    };

    beforeEach(() => {
        jest.resetAllMocks();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                status: 200,
                json: () => Promise.resolve({}),
            }),
        ) as jest.Mock;
    });

    test('renders form fields and submit button', () => {
        render(<AddUserFormMittel {...initialProps} />);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/role/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /add user/i })).toBeInTheDocument();
    });

    test.skip('displays error if email already taken', async () => {
        const propsWithUser = {
            ...initialProps,
            users: [{ name: 'John Doe', email: 'john@example.com', role: USER_ROLE.CUSTOMER }],
        };

        render(<AddUserFormMittel {...propsWithUser} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await screen.findByText(/es ist ein fehler aufgetreten/i);
    });

    test('displays password error when criteria not met', () => {
        render(<AddUserFormMittel {...initialProps} />);

        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'short' } });

        expect(screen.getByText(/password needs to be 8 characters long/i)).toBeInTheDocument();
    });

    test.skip('calls setUsers on successful submission', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => expect(mockSetUsers).toHaveBeenCalledTimes(1));
    });

    test.skip('clears form on successful submission', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await waitFor(() => {
            expect(screen.getByLabelText(/name/i)).toHaveValue('');
            expect(screen.getByLabelText(/email/i)).toHaveValue('');
            expect(screen.getByLabelText(/password/i)).toHaveValue('');
            expect(screen.getByLabelText(/role/i)).toHaveValue('');
        });
    });

    test.skip('displays department field for admin or employee roles', () => {
        render(<AddUserFormMittel {...initialProps} />);

        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.ADMIN } });

        expect(screen.getByLabelText(/department/i)).toBeInTheDocument();
    });

    test.skip('closes error alert when close button is clicked', async () => {
        render(<AddUserFormMittel {...initialProps} />);

        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'duplicate@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password1!' } });
        fireEvent.change(screen.getByLabelText(/role/i), { target: { value: USER_ROLE.CUSTOMER } });

        await userEvent.click(screen.getByRole('button', { name: /add user/i }));

        await screen.findByText(/es ist ein fehler aufgetreten/i);

        await userEvent.click(screen.getByLabelText(/close-icon/i));

        await waitFor(() => expect(screen.queryByText(/es ist ein fehler aufgetreten/i)).not.toBeInTheDocument());
    });
});
