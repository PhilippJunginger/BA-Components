import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*

- type error - 3
- unnecessary waitFor - 3
- variable - 1
- setup

- 4 von 9 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: 0
CleanCode: -40
Testumfang: 22,2
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'new-image-url' }),
    }),
) as jest.Mock;

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2023-05-01T00:00:00Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardSchwer', () => {
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
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
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

    it('expands and collapses additional information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
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

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['test'], 'test.png', { type: 'image/png' });

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                'https://example.com/api/upload-image',
                expect.objectContaining({
                    method: 'POST',
                    body: expect.any(FormData),
                }),
            );
        });
    });

    it('shows snackbar message on failed image upload', async () => {
        global.fetch = jest.fn(() => Promise.reject('API error')) as jest.Mock;
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
        const file = new File(['test'], 'test.png', { type: 'image/png' });

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('handles user deletion correctly', async () => {
        const user = userEvent.setup();
        window.confirm = jest.fn(() => true);

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

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();

        await user.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(global.fetch).toHaveBeenCalledWith(
            'https://example.com/api/user',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({ userId: recentUser.id }),
            }),
        );

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('disables delete button for users registered more than 24 hours ago', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00Z',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Delete User')).toBeDisabled();
    });
});
