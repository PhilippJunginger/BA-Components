import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- assertion missing

- variable - 2
- typeerror - 4
- render Funktion
- unused import



- 8 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -40
Testumfang: 87,5
 */

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

const setup = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    render(
        <UserProfileCardMittel
            userProfile={userProfile || mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={currentUser || mockCurrentUser}
        />,
    );
};

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-picture.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText(/Registration Date:/i)).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/i)).toBeVisible();
        expect(screen.getByText(new Date(mockUserProfile.registrationDate).toLocaleDateString())).toBeVisible();
        expect(screen.getByText(/Last Login Date:/i)).toBeVisible();
        expect(screen.getByText(new Date(mockUserProfile.lastLoginDate).toLocaleDateString())).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/i)).not.toBeVisible();
    });

    it('toggles edit mode and displays input fields', async () => {
        setup();
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

    it.skip('updates user profile on edit and save', async () => {
        setup();
        const editButton = screen.getByText('Edit');

        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, ' Jane');
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(editButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'John Doe Jane',
            email: 'jane.doe@example.com',
        });
    });

    it('uploads new profile image', async () => {
        setup();
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const editButton = screen.getByText('Edit');

        await userEvent.click(editButton);

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        // Add assertions for image upload success
    });

    it('shows snackbar message on successful user edit', async () => {
        setup();
        const editButton = screen.getByText('Edit');

        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');

        await userEvent.type(nameInput, ' Jane');

        await userEvent.click(editButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('deletes user on delete button click', async () => {
        const userProfile = { ...mockUserProfile, registrationDate: new Date().toISOString() };
        setup(userProfile);

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables delete button for users registered less than 24 hours ago', () => {
        setup();
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button for users registered more than 24 hours ago', () => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const userProfile = { ...mockUserProfile, registrationDate: oneDayAgo };
        setup(userProfile);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it.skip('shows snackbar message on API error', async () => {
        const userProfile = { ...mockUserProfile, registrationDate: new Date().toISOString() };
        setup(userProfile);

        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
            }),
        ) as jest.Mock;

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });
});
