import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile, UserWithId } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- promises
- fireEvent
- waitFor prefer findBy
- node access

- variable - 2
- typeerror - 2


- 5 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -20
Testumfang: 56,25
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
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
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    test.skip('expands and collapses the card content', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    test('toggles edit mode and saves edited user information', async () => {
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

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('displays snackbar message on image upload failure', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to upload image'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

        expect(await screen.findByText('Failed to upload image')).toBeInTheDocument();
    });

    test.skip('deletes user successfully', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({ ok: true });

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalledWith(undefined));
    });

    test.skip('handles delete user failure', async () => {
        global.fetch = jest.fn().mockRejectedValueOnce(new Error('Failed to delete user'));

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(await screen.findByText('Failed to delete user')).toBeInTheDocument();
    });
});
