import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- prefer queryBy with .not

- setup
- variable - 3
- typeerror
- unnecessary waitFor - 4
- unused import


- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -50
Testumfang: 50
 */

describe('UserProfileCardMittel Component', () => {
    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/image.jpg',
        registrationDate: '2024-07-10T00:00:00Z',
        lastLoginDate: '2024-07-10T00:00:00Z',
    };

    const setUserProfile = jest.fn();

    it('should display user profile information', () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should toggle edit mode', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /Edit/i });
        await user.click(editButton);

        expect(screen.getByRole('textbox', { name: /Name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /Email/i })).toBeInTheDocument();
    });

    it('should edit user information and save', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /Edit/i });
        await user.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: /Name/i });
        const emailInput = screen.getByRole('textbox', { name: /Email/i });

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload failure', async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 400,
            }),
        ) as jest.Mock;

        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /Edit/i });
        await user.click(editButton);

        const fileInput = screen.getByLabelText(/Change Profile Picture/i);
        const file = new File(['(⌐□_□)'], 'image.png', { type: 'image/png' });

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('should handle user deletion', async () => {
        const user = userEvent.setup();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /Delete User/i });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('Failed to delete user')).not.toBeInTheDocument();
    });

    it('should expand and collapse additional information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByRole('button', { name: /show more/i });
        await user.click(expandButton);

        expect(screen.getByText('Registration Date: 7/10/2024')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/10/2024')).toBeInTheDocument();
    });

    it.skip('should close snackbar', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /Edit/i });
        await user.click(editButton);

        const saveButton = screen.getByRole('button', { name: /Save/i });
        await user.click(saveButton);

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
