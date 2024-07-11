import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*


- variable - 2
- typeerror - 4
- date creation
- setup
- unnecessary waitFOr - 2

- 5 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -50
Testumfang: 43,75
 */

// Mock the fetch function
global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ profileImageUrl: 'new-image-url.jpg' }),
    }),
) as jest.Mock;

describe('UserProfileCardMittel', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'profile.jpg',
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

    it('toggles expanded view when expand button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        await user.click(expandButton);
        expect(
            screen.queryByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('allows editing user profile when edit button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toHaveValue(mockUserProfile.name);
        expect(emailInput).toHaveValue(mockUserProfile.email);

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
    });

    it('shows snackbar message when image upload fails', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Upload failed')));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['test'], 'test.png', { type: 'image/png' });
        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('disables delete user button when user is registered for more than a day', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: '2022-01-01T00:00:00.000Z',
        };

        render(
            <UserProfileCardMittel
                userProfile={oldUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('enables delete user button when user is registered for less than a day', () => {
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();
    });

    it.skip('calls setUserProfile with undefined when delete user succeeds', async () => {
        const user = userEvent.setup();
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('shows snackbar message when delete user fails', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Delete failed')));

        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        render(
            <UserProfileCardMittel
                userProfile={newUser}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
