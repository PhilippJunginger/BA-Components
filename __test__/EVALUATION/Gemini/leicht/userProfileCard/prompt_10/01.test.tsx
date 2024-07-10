import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- unused import
- variable - 2

- 3 von 5 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -15
Testumfang: 50
 */

describe('UserProfileCardLeicht', () => {
    const user: UserWithId = { id: '1', name: 'Alice', email: 'alice@example.com', password: 'password123' };
    const userProfile: UserProfile = {
        id: '1',
        name: 'Alice Johnson',
        email: 'alice@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    test('renders basic user profile information', () => {
        render(<UserProfileCardLeicht userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />);

        expect(screen.getByText('Alice Johnson')).toBeInTheDocument();
        expect(screen.getByText('Email: alice@example.com')).toBeInTheDocument();
    });

    test('expands to show additional details', async () => {
        render(<UserProfileCardLeicht userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />);

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
    });

    test('toggles edit mode and updates user profile', async () => {
        const mockSetUserProfile = jest.fn();
        render(
            <UserProfileCardLeicht userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton); // Enter edit mode

        const nameField = screen.getByLabelText('Name');
        const emailField = screen.getByLabelText('Email');
        await userEvent.clear(nameField);
        await userEvent.type(nameField, 'Updated Name');
        await userEvent.clear(emailField);
        await userEvent.type(emailField, 'updated@example.com');

        await userEvent.click(screen.getByText('Save')); // Save changes

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Updated Name',
            email: 'updated@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument(); // Snackbar message
    });

    test('disables delete button within 24 hours of registration', () => {
        render(<UserProfileCardLeicht userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled(); // Registration is within 24 hours
    });

    // ... Add more tests for other scenarios like:
    // - Deleting user after 24 hours
    // - Error states (e.g., failed update, profile image not found)
    // - Input validation in edit mode
});
