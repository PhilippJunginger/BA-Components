import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises

- unused import
- const missing
- typeerror - 1

- 3 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 27,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'securePassword',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks(); // If using fetchMock for API mocking
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'show more' })).toBeInTheDocument();
    });

    it('toggles the expanded state when the "show more" button is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        expect(screen.getByText(`Registration Date:`)).toBeInTheDocument();
        expect(screen.getByText(`Last Login Date:`)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(`Registration Date:`)).not.toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        const newName = 'Jane Doe';
        const newEmail = 'janedoe@example.com';
        await userEvent.type(screen.getByLabelText('Name'), newName);
        await userEvent.type(screen.getByLabelText('Email'), newEmail);

        await userEvent.click(screen.getByRole('button', { name: 'Save' }));
        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: newName,
                email: newEmail,
            });
        });
    });

    it('opens profile page when the "Show Profile Page" button is clicked', async () => {
        const mockRouterPush = jest.fn();
        jest.spyOn(require('next/router'), 'useRouter').mockReturnValue({
            push: mockRouterPush,
        });

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByRole('button', { name: 'show more' }));
        await userEvent.click(screen.getByRole('button', { name: 'Show Profile Page' }));
        expect(mockRouterPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    // ... more tests for image upload, user delete, snackbar, etc.
});
