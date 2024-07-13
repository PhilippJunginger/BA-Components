import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- waitFor assertion

- type error - 5
- unnecessary waitFor - 5
- variable
- setup
- date creation
- unused import

- 8 von 9 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -10
CleanCode: -70
Testumfang: 66,6
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: '2023-01-01',
    lastLoginDate: '2023-06-01',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

describe('UserProfileCardSchwer', () => {
    const mockSetUserProfile = jest.fn();
    const mockRouter = { push: jest.fn() };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
            }),
        ) as jest.Mock;
        global.window.confirm = jest.fn(() => true);
    });

    afterEach(() => {
        jest.clearAllMocks();
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
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('toggles edit mode when edit button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    });

    it('updates user profile when save button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane@example.com',
            }),
        );
    });

    it('expands additional information when expand button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByLabelText('show more'));

        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
    });

    it('navigates to profile page when "Show Profile Page" button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByLabelText('show more'));
        await user.click(screen.getByText('Show Profile Page'));

        expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it('handles image upload correctly', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
        });
    });

    it('shows error message when image upload fails', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('disables delete button when user cannot be deleted', () => {
        const recentUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardSchwer
                userProfile={recentUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it('enables delete button when user can be deleted', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeEnabled();
    });

    it('deletes user when delete button is clicked and confirmed', async () => {
        const user = userEvent.setup();
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        expect(global.window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', expect.any(Object));
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('shows error message when user deletion fails', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Delete failed'));

        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
