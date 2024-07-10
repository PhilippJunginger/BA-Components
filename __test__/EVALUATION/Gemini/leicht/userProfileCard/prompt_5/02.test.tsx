import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- no assetions - 4


- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -50
CleanCode: 0
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

describe('UserProfileCardLeicht', () => {
    test('renders user profile card and expands details', () => {
        // ... (test for basic rendering and expansion)
    });

    test('toggles edit mode and updates user profile', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={{ id: '1', name: '', email: '', password: '' }}
            />,
        );

        // ... (test for edit mode and updating profile)
        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    test('deletes user when delete button is clicked and conditions are met', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={{ ...mockUserProfile, registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 23) }}
                setUserProfile={setUserProfileMock}
                currentUser={{ id: '1', name: '', email: '', password: '' }}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));
        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    test('shows snackbar message on successful edit', async () => {
        // ... (test to ensure snackbar message appears after successful edit)
    });

    test('disables delete button if user registration is less than 24 hours old', async () => {
        // ... (test to ensure delete button is disabled if registration is recent)
    });

    test('handles errors when setUserProfile throws an exception', async () => {
        const setUserProfileMock = jest.fn().mockRejectedValue(new Error('Failed to update profile'));
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={{ id: '1', name: '', email: '', password: '' }}
            />,
        );
        // ... (test to ensure error handling and potentially a snackbar message)
    });
});
