import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import '@testing-library/jest-dom';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- waitFor assertions

- date creation
- typeerror - 2
- unused import
- unnecessary module import

- 4 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 38,85
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserProfileCardSchwer Component', () => {
    const mockUserProfile: UserProfile = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };
    const mockCurrentUser: UserWithId = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Check if basic profile information is rendered
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('expands and shows additional details when "Expand More" is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        // Check if additional details are visible
        await waitFor(() => {
            expect(
                screen.getByText(
                    `Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`,
                ),
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
            ).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Show Profile Page' })).toBeInTheDocument();
        });
    });

    // ... (Add more tests for edit mode, image upload, delete functionality, etc.)

    it('toggles edit mode', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        const saveButton = screen.getByRole('button', { name: 'Save' });
        expect(saveButton).toBeInTheDocument();
    });

    it('navigates to profile page', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Expand to see the navigation button
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        const showProfileButton = screen.getByRole('button', { name: 'Show Profile Page' });
        await userEvent.click(showProfileButton);
        expect(useRouter().push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it.skip('shows snackbar on image upload error', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Simulate an image upload error
        // ... (you'll need to mock fetch and return an error response)

        // Check if snackbar with error message is visible
        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });
});
