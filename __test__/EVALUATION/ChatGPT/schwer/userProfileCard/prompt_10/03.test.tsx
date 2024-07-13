import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent

- variable - 2
- type error - 2
- render Funktion
- unnecessary waitFor - 1
- unused import

- 5 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -35
Testumfang: 44,4
 */

// Mocking next/router
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

describe('UserProfileCardSchwer Component', () => {
    const mockRouterPush = jest.fn();
    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: '2023-01-01T00:00:00Z',
        lastLoginDate: '2023-07-01T00:00:00Z',
    };
    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
    };

    beforeEach(() => {
        (useRouter as jest.Mock).mockReturnValue({
            push: mockRouterPush,
        });
    });

    it('renders the user profile card with user details', () => {
        render(
            <UserProfileCardSchwer userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('toggles edit mode and saves changes', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('handles image upload', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalled();
        });
    });

    it('navigates to the profile page on button click', async () => {
        render(
            <UserProfileCardSchwer userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouterPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfile.id}`);
    });

    it.skip('shows a snackbar message and closes it', async () => {
        render(
            <UserProfileCardSchwer userProfile={userProfile} setUserProfile={jest.fn()} currentUser={currentUser} />,
        );

        // Simulate setting a snackbar message
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        await userEvent.click(screen.getByText('Save'));

        const snackbar = screen.getByText('User edited successfully');
        expect(snackbar).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(snackbar).not.toBeInTheDocument();
        });
    });

    it.skip('handles user deletion', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
        });
    });

    it('disables delete button for users registered less than a day ago', () => {
        const recentUserProfile = { ...userProfile, registrationDate: new Date().toISOString() };
        render(
            <UserProfileCardSchwer
                userProfile={recentUserProfile}
                setUserProfile={jest.fn()}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
