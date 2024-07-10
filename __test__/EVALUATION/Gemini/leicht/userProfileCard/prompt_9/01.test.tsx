import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises

- unused import
- variable - 3

- 3 von 5 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 50
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1', // Same ID as userProfile for ownership
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'securePassword',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const saveButton = screen.getByText('Save');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'janedoe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument(); // Snackbar message
    });

    it('expands to show additional details', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        // Ensure registration and last login dates are displayed
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
    });

    it('disables delete button within 24 hours of registration', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled(); // Initially disabled
    });
    // ... (Add more test cases as needed to achieve high coverage)
});
