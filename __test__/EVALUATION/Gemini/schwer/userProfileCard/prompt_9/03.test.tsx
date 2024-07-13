import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { SnackbarProvider } from '@mui/material';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises

- variable - 1
- typeerror - 2
- unused import
- unnecessary module import

- 1 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 5,55
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch API
global.fetch = jest.fn() as jest.Mock;

// Mock data
const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });

        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue({
                profileImageUrl: 'https://example.com/new-profile.jpg',
            }),
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the user profile information correctly', () => {
        const mockSetUserProfile = jest.fn();

        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={mockSetUserProfile}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            mockUserProfile.profileImageUrl,
        );
    });

    // ... (Add more tests to cover other scenarios like editing, image upload, delete, etc.)
    it('toggles edit mode and updates user profile', async () => {
        const mockSetUserProfile = jest.fn();
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={mockSetUserProfile}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );

        await userEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    // ... (Test other functionality like image upload, profile page navigation, user deletion, etc.)
});
