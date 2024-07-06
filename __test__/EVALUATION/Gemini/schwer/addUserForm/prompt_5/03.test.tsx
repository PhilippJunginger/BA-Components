import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { User, USER_ROLE } from '../../../../../../models/user';

/*
- userEvent setup
- fireEvent
- mocking wrong function
- missing assertion

- render Funktion
- wrong component name
- enum

- 4 von 6 notwendigem Testumfang erreicht + 2 Redundazen


Best-Practices: -40
CleanCode: -15
Testumfang: 58,45
 */

const mockedUsedNavigate = jest.fn();

jest.mock('next/router', () => ({
    useRouter() {
        return {
            push: mockedUsedNavigate,
            query: '',
        };
    },
}));

jest.mock('../../services/apiService', () => ({
    createUser: jest.fn(),
}));

const mockUsers: User[] = [
    {
        name: 'Test User',
        email: 'test@gmail.com',
        role: USER_ROLE.CUSTOMER,
        password: 'Testpassword1!',
        id: '1',
    },
];

const renderComponent = () => {
    return render(<AddUserForm users={mockUsers} setUsers={() => {}} />);
};

describe('AddUserForm Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should render all input fields', () => {
        renderComponent();

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
        expect(screen.getByText('Add User')).toBeInTheDocument();
    });

    it('should display error message when email is already taken', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Max Mustermann');
        await userEvent.type(emailInput, 'test@gmail.com');
        await userEvent.type(passwordInput, 'Testtest1!');
        fireEvent.submit(submitButton);

        expect(await screen.findByText('Es ist ein Fehler aufgetreten!')).toBeVisible();
    });

    it('should show password error messages', async () => {
        renderComponent();

        const passwordInput = screen.getByLabelText('Password');
        await userEvent.type(passwordInput, 'Test');

        expect(screen.getByText('Password needs to be 8 characters long')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one digit')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one uppercase and one lowercase letter')).toBeVisible();
        expect(screen.getByText('Needs to contain at least one special character')).toBeVisible();
    });

    it('should correctly create a new user', async () => {
        renderComponent();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const passwordInput = screen.getByLabelText('Password');
        const roleSelect = screen.getByLabelText('Role');
        const submitButton = screen.getByText('Add User');

        await userEvent.type(nameInput, 'Max Mustermann');
        await userEvent.type(emailInput, 'test1@gmail.com');
        await userEvent.type(passwordInput, 'Testtest1!');
        fireEvent.change(roleSelect, { target: { value: USER_ROLE.CUSTOMER } });
        fireEvent.submit(submitButton);

        // Add assertions to verify that the new user is correctly created
    });

    it('should display department input if role is not customer', async () => {
        renderComponent();

        const roleSelect = screen.getByLabelText('Role');
        await userEvent.click(roleSelect);
        const option = screen.getByText('ADMIN');
        await userEvent.click(option);

        expect(screen.getByLabelText('Department')).toBeVisible();
    });
});
