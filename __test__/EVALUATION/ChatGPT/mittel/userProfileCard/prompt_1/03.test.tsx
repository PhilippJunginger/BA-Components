import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import fetchMock from 'jest-fetch-mock';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- promises
- fireEvent
- waitFor prefer findBy
- node access

- variable - 3
- unused import
- typeerror - 2
- unnecessary waitFor - 2
- import of module


- 7 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -45
Testumfang: 81,25
 */

fetchMock.enableMocks();

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2023-07-01T00:00:00Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        fetchMock.resetMocks();
    });

    test('renders component with user profile information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    test('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await userEvent.clear(screen.getByLabelText('Name'));
        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' })),
        );
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('expands and collapses additional user information', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByLabelText('show more'));

        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/1/2023')).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText('show more'));

        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 7/1/2023')).not.toBeInTheDocument();
    });

    test('handles image upload', async () => {
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        fetchMock.mockResponseOnce(JSON.stringify({ profileImageUrl: 'https://example.com/new-image.jpg' }));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const input = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        await userEvent.upload(input!, file);

        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({ profileImageUrl: 'https://example.com/new-image.jpg' }),
            ),
        );
    });

    test('displays error message when image upload fails', async () => {
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        fetchMock.mockReject(new Error('Failed to upload image'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));

        const input = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        await userEvent.upload(input!, file);

        expect(await screen.findByText('Failed to upload image')).toBeInTheDocument();
    });

    test('deletes user profile', async () => {
        fetchMock.mockResponseOnce(JSON.stringify({ success: true }));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalledWith(undefined));
    });

    test('displays error message when deleting user fails', async () => {
        fetchMock.mockReject(new Error('Failed to delete user'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));

        expect(await screen.findByText('Failed to delete user')).toBeInTheDocument();
    });

    test('handles snackbar close', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        await userEvent.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
