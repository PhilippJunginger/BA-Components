import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack'; // Import SnackbarProvider
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer'; // Extend expect for better assertions

/*
- setup
- promises
- waitFor

- variable
- unnecessary import of module
- unused import
- unnecessary waitFor - 2

- 2 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 16,65
 */

global.fetch = jest.fn() as jest.Mock; // Mock global fetch for API calls

// Mock data for testing
const mockUserProfile: UserProfile = {
    id: '123',
    name: 'John Doe',
    email: 'johndoe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};
const mockCurrentUser: UserWithId = {
    id: '123',
    email: 'johndoe@example.com',
    password: 'password123',
    name: 'John',
};

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile information correctly', () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={jest.fn()}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: johndoe@example.com')).toBeInTheDocument();
    });

    test('expands and collapses additional information on click', async () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={jest.fn()}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
            expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
            expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();
        });

        await userEvent.click(expandButton);
        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
    });

    test('switches to edit mode and back', async () => {
        render(
            <SnackbarProvider>
                <UserProfileCardSchwer
                    userProfile={mockUserProfile}
                    setUserProfile={jest.fn()}
                    currentUser={mockCurrentUser}
                />
            </SnackbarProvider>,
        );
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        await waitFor(() => {
            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
        });
        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);
        await waitFor(() => {
            expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
            expect(screen.queryByText('Change Profile Picture')).not.toBeInTheDocument();
        });
    });

    // ... (More tests for API interactions, image upload, delete user, etc.)
});
