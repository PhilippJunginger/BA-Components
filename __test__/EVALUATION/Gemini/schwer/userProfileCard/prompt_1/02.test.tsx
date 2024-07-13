import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import { SnackbarProvider } from '@mui/material';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup

- variable - 2
- unnecessary import of module
- unused import - 2
- typeerror

- 2 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -30
Testumfang: 16,65
 */

// Mock the useRouter hook from next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock the fetch API
global.fetch = jest.fn();

describe('UserProfileCardSchwer Component', () => {
    const userProfile: UserProfile = {
        id: '123',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: '2023-01-01',
        lastLoginDate: '2023-01-02',
    };

    const currentUser: UserWithId = {
        id: '123',
        name: 'John',
        email: 'johndoe@email.com',
        password: 'password123',
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
        (fetch as jest.Mock).mockResolvedValue({
            ok: true,
            json: jest.fn().mockResolvedValue({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
        });
    });

    it('renders the user profile information correctly', () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />
            </SnackbarProvider>,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            userProfile.profileImageUrl,
        );
    });

    it('expands and collapses the additional information section', async () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />
            </SnackbarProvider>,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        await userEvent.click(expandButton);
        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={userProfile}
                    setUserProfile={setUserProfileMock}
                    currentUser={currentUser}
                />
            </SnackbarProvider>,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.click(screen.getByText('Save'));

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    // Add more tests for image upload, profile page navigation,
    // delete user functionality, snackbar behavior, and edge cases
});
