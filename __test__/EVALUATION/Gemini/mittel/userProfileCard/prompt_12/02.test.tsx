import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent

- typeerror - 8
- variable - 3


- 5 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -55
Testumfang: 43,75
 */

const mockUserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-04-08T10:00:00.000Z',
    lastLoginDate: '2023-04-08T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

describe('UserProfileCardMittel Component', () => {
    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional information', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date: 04/08/2023')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 04/08/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/08/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 04/08/2023')).not.toBeVisible();
    });

    it('toggles edit mode and displays input fields', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

        await userEvent.click(editButton);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
        expect(screen.queryByText('Change Profile Picture')).not.toBeInTheDocument();
    });

    it('updates user profile on save', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        await userEvent.click(editButton);

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Updated Name',
        });
    });

    it('uploads new profile image', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
            }),
        ) as jest.Mock;

        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File([''], 'new-profile.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });
    });

    it('deletes user profile', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardMittel
                userProfile={{ ...mockUserProfile, registrationDate: '2023-04-07T10:00:00.000Z' }}
                setUserProfile={setUserProfileMock}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });
        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables delete button for recently registered users', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('shows snackbar messages', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={() => {}}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.queryByRole('alert')).not.toBeInTheDocument();

        // Trigger snackbar message by attempting to upload large file
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File([''], 'large-file.jpg', { type: 'image/jpeg' });
        Object.defineProperty(file, 'size', { value: 2097152 }); // 2MB
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByRole('alert')).toBeVisible();
        expect(screen.getByText('File size should be less than 1MB')).toBeVisible();
    });
});
