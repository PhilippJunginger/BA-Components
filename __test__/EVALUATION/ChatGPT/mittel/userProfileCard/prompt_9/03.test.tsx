import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent
- node access

- variable - 3
- typeerror - 5
- unnecessary waitFor - 5


- 6 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -65
Testumfang: 56,25
 */

const mockUserProfile: UserProfile = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-07-10T00:00:00.000Z',
    lastLoginDate: '2023-07-10T00:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '123',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

describe('UserProfileCardMittel', () => {
    let setUserProfileMock: jest.Mock;

    beforeEach(() => {
        setUserProfileMock = jest.fn();
    });

    test('renders user profile information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    test('expands to show additional information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        fireEvent.click(screen.getByLabelText('show more'));
        expect(screen.getByText('Registration Date: 7/10/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/10/2023')).toBeInTheDocument();
    });

    test('toggles edit mode', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        await userEvent.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    test('saves edited user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        await userEvent.click(screen.getByText('Edit'));
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');
        await userEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });
    });

    test.skip('shows snackbar on save', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    test.skip('handles image upload error', async () => {
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: false,
            }),
        );

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        await userEvent.click(screen.getByText('Edit'));

        const file = new File(['file content'], 'profile.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]')!;
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });

        global.fetch.mockClear();
    });

    test('handles delete user', async () => {
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        );

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
        });

        global.fetch.mockClear();
    });

    test.skip('disables delete button if user cannot be deleted', () => {
        const userProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        };
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    test.skip('closes snackbar', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );
        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText('close'));

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
