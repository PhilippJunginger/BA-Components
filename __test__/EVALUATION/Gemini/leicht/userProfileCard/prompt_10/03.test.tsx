import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht'; // for extended matchers like toBeInTheDocument

/*

- setup
- unnecessary import
- variable - 1
- render Funktion

- 3 von 5 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -20
Testumfang: 50
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1', // Same ID as the user profile
        name: 'Current User',
        email: 'current@example.com',
        password: 'password',
    };

    const renderComponent = (userProfile: UserProfile, currentUser: UserWithId) => {
        const mockSetUserProfile = jest.fn();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
        return { mockSetUserProfile };
    };

    it('renders basic profile information', () => {
        renderComponent(mockUserProfile, mockCurrentUser);

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('toggles the expanded details', async () => {
        const user = userEvent.setup();
        renderComponent(mockUserProfile, mockCurrentUser);

        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument(); // Not visible initially

        await user.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();

        await user.click(expandButton); // Collapse
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
    });

    it('enters and saves edit mode (only for current user)', async () => {
        const user = userEvent.setup();
        const { mockSetUserProfile } = renderComponent(mockUserProfile, mockCurrentUser);

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await user.clear(nameInput);
        await user.type(nameInput, 'Edited Name');
        await user.clear(emailInput);
        await user.type(emailInput, 'edited@example.com');

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Edited Name',
            email: 'edited@example.com',
        });
    });

    it.skip('deletes the user profile if registered less than 24 hours', async () => {
        const user = userEvent.setup();
        const { mockSetUserProfile } = renderComponent(mockUserProfile, mockCurrentUser);
        // Override registrationDate to be within the last 24 hours
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1); // Set to yesterday
        mockUserProfile.registrationDate = yesterday;

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    // Add tests to cover Snackbar behavior after edit/delete
});
