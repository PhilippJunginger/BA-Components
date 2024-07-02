import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- critical: Verwendung von fireEvent
- critical: Kein instantiierung von userEvent.setup()

- clean code: sehr komplizierte render Funktion erstellt
- clean code: Logik von Tests in eine Funktion ausgelagert

- 4 von 4 notwendigem Testumfang erreicht + 2 Redundanzen

Best-Practices: -20
CleanCode: -15
Testumfang: 75
 */

describe('AddUserFormLeicht', () => {
    const setup = (overrides = {}) => {
        const defaultProps = {
            users: [],
            setUsers: jest.fn(),
        };
        const props = { ...defaultProps, ...overrides };

        render(<AddUserFormLeicht {...props} />);
        return props;
    };

    const fillForm = async (name: string, email: string, password: string, role: USER_ROLE, department?: string) => {
        await userEvent.type(screen.getByLabelText(/Name/i), name);
        await userEvent.type(screen.getByLabelText(/Email/i), email);
        await userEvent.type(screen.getByLabelText(/Password/i), password);
        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: role } });
        if (department) {
            await userEvent.type(screen.getByLabelText(/Department/i), department);
        }
    };

    it('should render form fields correctly', () => {
        setup();
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    });

    it.skip('should display error for existing email', async () => {
        const existingUsers: User[] = [
            { name: 'John Doe', email: 'john@example.com', role: USER_ROLE.ADMIN, password: 'Password1!' },
        ];
        const { setUsers } = setup({ users: existingUsers });

        await fillForm('Jane Doe', 'john@example.com', 'Password1!', USER_ROLE.ADMIN);
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsers).not.toHaveBeenCalled();
        expect(screen.getByText(/Email already exists!/i)).toBeInTheDocument();
    });

    it.skip('should display password validation error', async () => {
        setup();

        await fillForm('Jane Doe', 'jane@example.com', 'pass', USER_ROLE.ADMIN);
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(screen.getByText(/Password needs to be 8 characters long/i)).toBeInTheDocument();
        expect(
            screen.getByText(/Needs to contain at least one uppercase and one lowercase letter/i),
        ).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one digit/i)).toBeInTheDocument();
        expect(screen.getByText(/Needs to contain at least one special character/i)).toBeInTheDocument();
    });

    it.skip('should add user correctly with valid inputs', async () => {
        const { setUsers } = setup();

        await fillForm('Jane Doe', 'jane@example.com', 'Password1!', USER_ROLE.ADMIN);
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsers).toHaveBeenCalledWith([
            {
                name: 'Jane Doe',
                email: 'jane@example.com',
                password: 'Password1!',
                role: USER_ROLE.ADMIN,
            },
        ]);
    });

    it.skip('should display department field for ADMIN or EMPLOYEE role', async () => {
        setup();

        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.ADMIN } });
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.EMPLOYEE } });
        expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/Role/i), { target: { value: USER_ROLE.CUSTOMER } });
        expect(screen.queryByLabelText(/Department/i)).not.toBeInTheDocument();
    });

    it.skip('should reset form after successful submission', async () => {
        const { setUsers } = setup();

        await fillForm('Jane Doe', 'jane@example.com', 'Password1!', USER_ROLE.ADMIN);
        fireEvent.submit(screen.getByRole('button', { name: /Add User/i }));

        expect(setUsers).toHaveBeenCalled();
        expect(screen.getByLabelText(/Name/i)).toHaveValue('');
        expect(screen.getByLabelText(/Email/i)).toHaveValue('');
        expect(screen.getByLabelText(/Password/i)).toHaveValue('');
        expect(screen.getByLabelText(/Role/i)).toHaveValue('');
    });
});
