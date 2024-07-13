import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom'; // For custom matchers
import { useRouter } from 'next/router';
import { SnackbarProvider } from '@mui/material';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import userEvent from '@testing-library/user-event'; // For Snackbar handling

/*
- setup

- variable - 1
- typeerror - 2
- unused import - 2
- unnecessary module import

- 1 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 5,55
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

// Mock fetch API to control responses
global.fetch = jest.fn();

describe('UserProfileCardSchwer Component', () => {
    const mockUserProfile: UserProfile = {
        id: '123',
        name: 'John Doe',
        email: 'johndoe@example.com',
        profileImageUrl: 'https://example.com/avatar.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockCurrentUser: UserWithId = {
        id: '123', // Same ID as userProfile for editing tests
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password',
    };

    const mockSetUserProfile = jest.fn();
    const mockRouterPush = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });

        global.fetch.mockClear(); // Clear fetch mocks for each test
    });

    it('renders user profile information correctly', () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={mockSetUserProfile}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={mockSetUserProfile}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).not.toBeVisible();
    });

    // ... (More tests for editing, image upload, delete user, error handling, etc.)
});
