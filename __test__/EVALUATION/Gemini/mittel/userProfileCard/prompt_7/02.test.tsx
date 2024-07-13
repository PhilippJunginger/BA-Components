import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card, IconButton } from '@mui/material';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup

- unused import
- typeerror - 3
- variable - 4
- render Funktion


- 8 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -45
Testumfang: 81,25
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

const renderComponent = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    return render(
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

    it('should render user profile information', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('should expand and collapse user details', async () => {
        renderComponent();

        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 03/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 03/16/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 03/15/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 03/16/2023')).not.toBeVisible();
    });

    it.skip('should toggle edit mode', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        expect(screen.getByRole('textbox', { name: 'Name' })).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'Change Profile Picture' })).toBeVisible();

        await userEvent.click(editButton);

        expect(screen.queryByRole('textbox', { name: 'Name' })).not.toBeVisible();
        expect(screen.queryByRole('textbox', { name: 'Email' })).not.toBeVisible();
        expect(screen.queryByRole('button', { name: 'Change Profile Picture' })).not.toBeVisible();
    });

    it('should update user profile on edit', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(editButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('should handle image upload', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        // Mock the fetch call
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
            }),
        ) as jest.Mock;

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-picture.jpg',
        });
    });

    it('should show snackbar message on successful user edit', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(editButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('should handle delete user', async () => {
        const userProfile = { ...mockUserProfile, id: '2' };
        const currentUser = { ...mockCurrentUser, id: '3' };
        renderComponent(userProfile, currentUser);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        // Mock the fetch call
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should show snackbar message on failed user delete', async () => {
        const userProfile = { ...mockUserProfile, id: '2' };
        const currentUser = { ...mockCurrentUser, id: '3' };
        renderComponent(userProfile, currentUser);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        // Mock the fetch call to throw an error
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to delete user'))) as jest.Mock;

        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('should disable delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23); // Set registration time to 23 hours ago

        const userProfile = { ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() };
        renderComponent(userProfile);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2); // Set registration date to 2 days ago

        const userProfile = { ...mockUserProfile, registrationDate: oldRegistrationDate.toISOString() };
        renderComponent(userProfile);

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeEnabled();
    });

    it.skip('should close the snackbar when the close button is clicked', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(editButton);

        const closeSnackbarButton = screen.getByRole('button', { name: 'close' });
        fireEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeVisible();
    });
});
