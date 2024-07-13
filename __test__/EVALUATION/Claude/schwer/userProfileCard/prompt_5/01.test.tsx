import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- waitFor assertions
- setup
- act inside test

- type error - 2
- unnecessary waitFor - 1
- variable - 2
- unused import
- date creation

- 6 von 9 notwendigem Testumfang erreicht + 5 Redundanz

Best-Practices: -30
CleanCode: -35
Testumfang: 38,85
 */

// Mock Next.js router
jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'new-image-url' }),
    }),
) as jest.Mock;

// Mock window.confirm
window.confirm = jest.fn(() => true);

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-06-01T00:00:00.000Z',
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

    it('toggles edit mode when Edit button is clicked', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
        expect(screen.queryByText('Change Profile Picture')).not.toBeInTheDocument();
    });

    it('updates user profile when changes are made and saved', async () => {
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

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
    });

    it('expands and collapses additional information', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Show Profile Page')).toBeInTheDocument();
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Show Profile Page')).not.toBeInTheDocument();
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    it('handles image upload correctly', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        await act(async () => {
            await userEvent.upload(fileInput, file);
        });

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                profileImageUrl: 'new-image-url',
            }),
        );
    });

    it('shows error message when image upload fails', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject('API error'));

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'test.png', { type: 'image/png' });

        await act(async () => {
            await userEvent.upload(fileInput, file);
        });

        expect(await screen.findByText('Failed to upload image')).toBeInTheDocument();
    });

    it.skip('navigates to profile page when Show Profile Page button is clicked', async () => {
        const { useRouter } = require('next/router');
        const pushMock = jest.fn();
        useRouter.mockImplementation(() => ({
            push: pushMock,
        }));

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        const showProfileButton = screen.getByText('Show Profile Page');
        await userEvent.click(showProfileButton);

        expect(pushMock).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
    });

    it('handles user deletion correctly', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', expect.any(Object));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('shows error message when user deletion fails', async () => {
        (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject('API error'));

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(await screen.findByText('Failed to delete user')).toBeInTheDocument();
    });

    it.skip('disables delete button for users registered more than 24 hours ago', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00.000Z',
        };

        render(
            <UserProfileCardSchwer
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('does not show edit and delete options for non-current user profiles', () => {
        const nonCurrentUser: UserWithId = {
            ...mockCurrentUser,
            id: '2',
        };

        render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={nonCurrentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });
});
