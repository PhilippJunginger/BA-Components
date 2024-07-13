import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- fireEvent
- node access

- variable - 1
- unnecessary let declaration - 3
- typeerror - 2
- unnecessary waitFor - 3

- 5 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -45
Testumfang: 38,85
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockUseRouter = useRouter as jest.Mock;

describe('UserProfileCardSchwer', () => {
    let userProfile: UserProfile;
    let currentUser: UserWithId;
    let setUserProfile: jest.Mock;

    beforeEach(() => {
        userProfile = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            profileImageUrl: 'https://example.com/profile.jpg',
            registrationDate: new Date().toISOString(),
            lastLoginDate: new Date().toISOString(),
        };

        currentUser = {
            id: '1',
            name: 'John Doe',
            email: 'john.doe@example.com',
            password: 'password123',
        };

        setUserProfile = jest.fn();
        mockUseRouter.mockReturnValue({
            push: jest.fn(),
        });
    });

    it('renders user profile card', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    it('toggles edit mode and edits user profile', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        const saveButton = screen.getByText('Save');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('handles image upload', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });

        fireEvent.change(fileInput!, { target: { files: [file] } });

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('expands and collapses additional info', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date:')).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();
    });

    it.skip('navigates to profile page', async () => {
        const pushMock = jest.fn();
        mockUseRouter.mockReturnValue({
            push: pushMock,
        });

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Show Profile Page'));

        await waitFor(() => {
            expect(pushMock).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfile.id}`);
        });
    });

    it('handles snackbar close', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        await userEvent.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('deletes user with confirmation', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('User deleted successfully')).toBeInTheDocument();
    });

    it.skip('prevents delete within one day', () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        userProfile.registrationDate = yesterday.toISOString();

        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
