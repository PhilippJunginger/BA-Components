import { render, screen } from '@testing-library/react';
import { User, USER_ROLE } from '../../../../../../models/user';
import AddUserFormLeicht from '../../../../../../components/leicht/addUserFormLeicht';
import userEvent from '@testing-library/user-event';

/*
- unnecessary mock of module

- doppelung userEvent setup
- doppelung variablen - 2
- render Funktion
- fill FUhnkton

- 3 von 4 notwendigem Testumfang erreicht


Best-Practices: -10
CleanCode: -30
Testumfang: 75
 */

// Mock MUI components to avoid unnecessary rendering and potential errors
jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    TextField: (props: any) => <input {...props} />,
    Select: (props: any) => <select {...props} />,
    MenuItem: (props: any) => <option {...props} />,
    FormControl: (props: any) => <div {...props} />,
    FormLabel: (props: any) => <label {...props} />,
    FormHelperText: (props: any) => <span {...props} />,
    Button: (props: any) => <button {...props} />,
}));

describe('AddUserFormLeicht', () => {
    const mockSetUsers = jest.fn();
    const existingUsers: User[] = [
        { name: 'Existing User', email: 'existing@user.com', role: USER_ROLE.CUSTOMER, password: 'password123!' },
    ];

    const renderForm = (users: User[] = existingUsers) => {
        render(<AddUserFormLeicht users={users} setUsers={mockSetUsers} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should add a new user with valid data', async () => {
        renderForm();
        const user = userEvent.setup();

        await fillForm(user, {
            name: 'New User',
            email: 'new@user.com',
            password: 'Password123!',
            role: USER_ROLE.ADMIN,
            department: 'Engineering', // Only for admin/employee
        });

        const submitButton = screen.getByRole('button', { name: 'Add User' });
        await user.click(submitButton);

        const expectedNewUser: User = {
            name: 'New User',
            email: 'new@user.com',
            password: 'Password123!',
            role: USER_ROLE.ADMIN,
            department: 'Engineering',
        };

        expect(mockSetUsers).toHaveBeenCalledWith([...existingUsers, expectedNewUser]);
        // Assert form fields are cleared
    });

    // Additional tests...
    it('should show email error when email is already taken', async () => {
        renderForm();
        const user = userEvent.setup();

        await fillForm(user, {
            email: 'existing@user.com',
        });

        const emailError = screen.getByText('Email already exists!');
        expect(emailError).toBeInTheDocument();
    });

    it('should show password errors when password is invalid', async () => {
        renderForm();
        const user = userEvent.setup();

        await fillForm(user, {
            password: 'short',
        });

        const passwordErrors = screen.getByText(/Password needs to be/);
        expect(passwordErrors).toBeInTheDocument();
    });

    // ... (Tests for role selection, department field visibility, form submission error handling, etc.)
});

async function fillForm(user: ReturnType<typeof userEvent.setup>, data: Partial<User> & { role: USER_ROLE }) {
    if (data.name) {
        const nameInput = screen.getByLabelText('Name');
        await user.type(nameInput, data.name);
    }

    if (data.email) {
        const emailInput = screen.getByLabelText('Email');
        await user.type(emailInput, data.email);
    }

    if (data.password) {
        const passwordInput = screen.getByLabelText('Password');
        await user.type(passwordInput, data.password);
    }

    const roleSelect = screen.getByLabelText('Role');
    await user.selectOptions(roleSelect, data.role);

    if (data.department && (data.role === USER_ROLE.ADMIN || data.role === USER_ROLE.EMPLOYEE)) {
        const departmentInput = await screen.findByLabelText('Department');
        await user.type(departmentInput, data.department);
    }
}
