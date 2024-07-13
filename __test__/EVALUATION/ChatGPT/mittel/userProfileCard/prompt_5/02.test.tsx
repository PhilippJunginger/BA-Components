import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- userEvent
- fireEvent
- prefer findBy

- variable - 3
- typeerror -


- 6 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -20
Testumfang: 68,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-01-10T00:00:00.000Z',
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
        jest.clearAllMocks();
    });

    test('renders user profile card', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    test('toggles edit mode and edits user profile', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('shows and hides the expanded content', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByLabelText('show more'));
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/10/2023')).toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('show more'));
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
    });

    test.skip('deletes user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Delete User'));
        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalledWith(undefined));
    });

    test('handles image upload with error', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        fireEvent.change(fileInput, {
            target: { files: [new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' })] },
        });

        // Mock the fetch response to simulate error
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            } as Response),
        );

        expect(await screen.findByText('Failed to upload image')).toBeInTheDocument();
    });

    test.skip('disables delete button for new users', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    test('displays snackbar message when file size exceeds limit', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        fireEvent.change(fileInput, {
            target: { files: [new File([new ArrayBuffer(2 * 1048576)], 'largefile.png', { type: 'image/png' })] },
        });

        expect(await screen.findByText('File size should be less than 1MB')).toBeInTheDocument();
    });
});
