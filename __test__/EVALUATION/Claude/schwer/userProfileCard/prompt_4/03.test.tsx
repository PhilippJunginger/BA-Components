import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*

- type error - 4
- unnecessary waitFor - 2
- variable
- setup
- date creation
- unused import

- 6 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -50
Testumfang: 49,95
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('UserProfileCardSchwer', () => {
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

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
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

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
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

    it('shows snackbar message when image upload fails', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Upload failed'));

        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'image.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('disables delete button if user registered less than 24 hours ago', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardSchwer
                userProfile={recentUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it('calls API to delete user when delete button is clicked and confirmed', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({ ok: true, status: 200 });
        global.confirm = jest.fn().mockReturnValueOnce(true);

        const user = userEvent.setup();
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await user.click(screen.getByText('Delete User'));

        expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: oldUserProfile.id }),
        });
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('shows error message when user deletion fails', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Delete failed'));
        global.confirm = jest.fn().mockReturnValueOnce(true);

        const user = userEvent.setup();
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: '2022-01-01',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUserProfile}
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
