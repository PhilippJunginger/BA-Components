import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises
- waitFor

- variable - 2
- unnecessary waitFor - 3
- unused import - 2
- typeerror - 3

- 3 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -50
Testumfang: 27,75
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('UserProfileCardSchwer Component', () => {
    const user: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'currentUser@example.com',
        password: 'password123',
    };
    const userProfile: UserProfile = {
        id: '2',
        name: 'Test User',
        email: 'test@example.com',
        profileImageUrl: 'https://example.com/avatar.jpg',
        registrationDate: '2024-01-01',
        lastLoginDate: '2024-07-01',
    };
    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    it('renders user profile data correctly', () => {
        render(
            <UserProfileCardSchwer userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    it('expands and shows additional details when clicked', async () => {
        render(
            <UserProfileCardSchwer userProfile={userProfile} setUserProfile={mockSetUserProfile} currentUser={user} />,
        );

        await userEvent.click(screen.getByLabelText('show more'));
        await waitFor(() => {
            expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
            expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
            expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
        });
    });

    it('toggles edit mode and saves changes', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={userProfile}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Edited Name');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'edited@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Edited Name',
                email: 'edited@example.com',
            }),
        );
    });

    it('uploads a new profile image', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ profileImageUrl: 'https://example.com/new-avatar.jpg' }));

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={userProfile}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const file = new File(['(mocked image)'], 'new-avatar.jpg', { type: 'image/jpeg' });
        const input = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        await userEvent.upload(input, file);
        await userEvent.click(screen.getByText('Save'));
        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                profileImageUrl: 'https://example.com/new-avatar.jpg',
            }),
        );
    });
    // ... (Tests for image upload errors, delete user, snackbar etc.)
});
