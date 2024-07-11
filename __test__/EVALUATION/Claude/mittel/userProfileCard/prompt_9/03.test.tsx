import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- setup

- variable -
- typeerror - 5
- date creation

- 5 von 8 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -20
CleanCode: -35
Testumfang: 37,5
 */

// Mock the fetch function
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
    profileImageUrl: 'https://example.com/image.jpg',
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

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it.skip('toggles expanded view when expand button is clicked', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(
            screen.queryByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
        expect(
            screen.queryByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('enters edit mode when Edit button is clicked', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('updates user profile when Save button is clicked', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
    });

    it('shows snackbar message when image upload fails', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to upload image'))) as jest.Mock;

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'image.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('disables Delete User button when user is registered for more than a day', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00Z',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('enables Delete User button when user is registered for less than a day', () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();
    });

    it.skip('calls setUserProfile with undefined when Delete User is successful', async () => {
        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('shows snackbar message when Delete User fails', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to delete user'))) as jest.Mock;

        const newUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
