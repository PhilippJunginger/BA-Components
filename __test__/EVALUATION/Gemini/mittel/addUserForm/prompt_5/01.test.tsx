import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddUserFormMittel from '../../../../../../components/mittel/addUserFormMittel';
import { USER_ROLE } from '../../../../../../models/user';

/*
- fireEvent
- no assertion

- userEvent.setzup doppelung
- TypeError - 2
- doppelung keine variable - 1

- 2 von 6 notwendigem Testumfang erreicht + 1 Redudndanz


Best-Practices: -20
CleanCode: -20
Testumfang: 21,75
 */

// Mock fetch to simulate API calls
global.fetch = jest.fn() as jest.Mock;

describe('AddUserFormMittel', () => {
    // Initial Props for the component
    const initialProps = {
        users: [],
        setUsers: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders the form correctly', () => {
        render(<AddUserFormMittel {...initialProps} />);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Role')).toBeInTheDocument();
    });

    test('submits the form with valid data', async () => {
        // Mock successful fetch response
        fetch.mockResolvedValueOnce({
            json: async () => ({ ...initialUser, id: 1 }), // Simulate a created user
        });

        render(<AddUserFormMittel {...initialProps} />);

        // Fill out form fields (using userEvent to simulate interactions)
        const user = userEvent.setup();
        await user.type(screen.getByLabelText('Name'), 'John Doe');
        await user.type(screen.getByLabelText('Email'), 'john.doe@example.com');
        await user.type(screen.getByLabelText('Password'), 'SecurePassword123!');

        fireEvent.change(screen.getByLabelText('Role'), { target: { value: USER_ROLE.CUSTOMER } });

        await user.click(screen.getByText('Add User'));

        // Asserts
        await waitFor(() => {
            expect(fetch).toHaveBeenCalledTimes(1);
            expect(initialProps.setUsers).toHaveBeenCalledWith([
                {
                    ...initialUser,
                    id: 1,
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    password: 'SecurePassword123!',
                },
            ]);
        });
    });

    // ... tests for password validation, email validation, error handling, etc.

    test('password validation', async () => {
        // ...
    });
});
