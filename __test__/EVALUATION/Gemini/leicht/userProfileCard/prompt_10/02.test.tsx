import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht'; // Import SnackbarProvider

/*
- setup
- fireEvent
- promises

- unnecessary import
- variable - 2

- 2 von 5 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -15
Testumfang: 30
 */

describe('UserProfileCardLeicht', () => {
    const user: UserWithId = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'securePassword',
    };

    const userProfile: UserProfile = {
        id: 'user123',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    it('renders user profile data correctly', () => {
        render(
            <SnackbarProvider>
                <UserProfileCardLeicht userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />
            </SnackbarProvider>,
        );

        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(
            <SnackbarProvider>
                <UserProfileCardLeicht userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />
            </SnackbarProvider>,
        );
        const expandButton = screen.getByLabelText('show more');

        // Expand
        fireEvent.click(expandButton);
        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        // Collapse
        fireEvent.click(expandButton);
        expect(
            screen.queryByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        const mockSetUserProfile = jest.fn();
        render(
            <SnackbarProvider>
                <UserProfileCardLeicht
                    userProfile={userProfile}
                    setUserProfile={mockSetUserProfile}
                    currentUser={user}
                />
            </SnackbarProvider>,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, 'Edited Name');
        await userEvent.type(emailInput, 'edited@example.com');

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Edited Name',
            email: 'edited@example.com',
        });
    });

    // ... (Add test to verify the delete button is disabled when appropriate)
});
