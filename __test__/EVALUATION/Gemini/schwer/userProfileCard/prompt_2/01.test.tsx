import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup

- variable
- unused import
- typeerror
- date creation
- unnecessary waitFor

- 2 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -10
CleanCode: -25
Testumfang: 16,65
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
    password: 'password123',
};

const mockSetUserProfile = jest.fn();
const mockRouterPush = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: mockRouterPush,
    }),
}));

global.fetch = jest.fn() as jest.MockedFunction<typeof fetch>;

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile details correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(
            screen.queryByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
    });

    it.skip('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const newProfileImageUrl = 'https://example.com/newprofile.jpg';

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'janedoe@example.com');

        fetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: newProfileImageUrl }),
        } as Response);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(mocked file)'], 'profile.jpg', { type: 'image/jpeg' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'janedoe@example.com',
            profileImageUrl: newProfileImageUrl,
        });
    });

    // ... (More tests for handleImageUpload, handleProfilePageNavigation,
    // handleDeleteUser, handleCloseSnackbar, and canDeleteUser)
});
