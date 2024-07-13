import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- setup
- fireEvent

- variable - 2
- typeerror - 2


- 5 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -20
Testumfang: 56,25
 */

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    department: 'Engineering',
};

const userProfile: UserProfile = {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

describe('UserProfileCardMittel', () => {
    it.skip('renders user profile correctly', () => {
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );
        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode', () => {
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it.skip('expands and collapses the card', () => {
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();
    });

    it('shows snackbar on save', () => {
        const setUserProfile = jest.fn();
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Smith' } });
        fireEvent.click(screen.getByText('Save'));
        expect(setUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Smith' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('uploads image successfully', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
            }),
        ) as jest.Mock;

        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );
        fireEvent.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['image content'], 'image.jpg', { type: 'image/jpeg' });

        await userEvent.upload(fileInput, file);
        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });

    it('disables delete button based on registration date', () => {
        const recentUserProfile: UserProfile = {
            ...userProfile,
            registrationDate: new Date().toISOString(),
        };
        render(
            <UserProfileCardMittel
                userProfile={recentUserProfile}
                setUserProfile={jest.fn()}
                currentUser={currentUser}
            />,
        );
        expect(screen.getByText('Delete User')).toBeDisabled();
    });
});
