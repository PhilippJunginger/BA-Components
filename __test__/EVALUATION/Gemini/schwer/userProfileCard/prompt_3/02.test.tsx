import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- fireEvent
- node access

- variable - 5
- typeerror - 2
- render Funktion

- 8 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -40
Testumfang: 72,15
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const mockFetch = jest.fn();
global.fetch = mockFetch;

const setup = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    render(
        <UserProfileCardSchwer
            userProfile={userProfile || mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={currentUser || mockCurrentUser}
        />,
    );
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            'https://example.com/profile-picture.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 03/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 03/16/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();
    });

    it.skip('allows editing user profile information', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });
        const changeProfilePictureButton = screen.getByRole('button', { name: 'Change Profile Picture' });

        expect(editButton).toHaveTextContent('Save');

        await userEvent.type(nameInput, ' Jane');
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(editButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'John Doe Jane',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('handles image upload', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
        });

        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        await userEvent.upload(fileInput as HTMLInputElement, file);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-picture.jpg',
        });
    });

    it.skip('handles image upload error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to upload image'));

        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        await userEvent.upload(fileInput as HTMLInputElement, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it.skip('navigates to user profile page', async () => {
        (useRouter as jest.Mock).mockReturnValue({
            push: jest.fn(),
        });

        setup();
        const showProfilePageButton = screen.getByRole('button', { name: 'Show Profile Page' });

        await userEvent.click(showProfilePageButton);

        expect(useRouter().push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('deletes user', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        // Mock window.confirm to return true
        window.confirm = jest.fn(() => true);

        await userEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('handles delete user error', async () => {
        mockFetch.mockRejectedValueOnce(new Error('Failed to delete user'));

        setup();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        // Mock window.confirm to return true
        window.confirm = jest.fn(() => true);

        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23);

        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: recentRegistrationDate.toISOString(),
        };

        setup(recentUserProfile);
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);

        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: oldRegistrationDate.toISOString(),
        };

        setup(oldUserProfile);
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        expect(deleteButton).toBeEnabled();
    });

    it.skip('closes the snackbar', async () => {
        setup();
        const editButton = screen.getByRole('button', { name: 'Edit' });

        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });

        await userEvent.type(nameInput, ' Jane');

        await userEvent.click(editButton);

        const snackbar = screen.getByText('User edited successfully');
        const closeSnackbarButton = within(snackbar).getByRole('button');

        fireEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
