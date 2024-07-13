import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserWithId } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent
- interface usage
- node access
- missing assertion

- variable - 3
- typeerro
- render Funktion

- 5 von 8 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -50
CleanCode: -25
Testumfang: 37,5
 */

const mockUserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    profileImageUrl: 'test.jpg',
    registrationDate: '2023-08-10T10:00:00.000Z',
    lastLoginDate: '2023-08-10T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@test.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const setup = (userProfile?: any, currentUser?: UserWithId) => {
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

    it('should render user profile information', () => {
        setup();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@test.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'test.jpg');
    });

    it('should expand and collapse additional information', async () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 8/10/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 8/10/2023')).toBeVisible();
        await userEvent.click(expandButton);
        // Expect the content to be hidden (not present in the DOM)
        expect(screen.queryByText('Registration Date: 8/10/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 8/10/2023')).not.toBeInTheDocument();
    });

    it('should toggle edit mode', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it.skip('should save edited user profile', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.type(nameInput, ' Edited');
        await userEvent.type(emailInput, 'edited@test.com');
        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Test User Edited',
            email: 'editedemail@test.com',
        });
    });

    it.skip('should handle image upload', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const fileInput = screen.getByText('Change Profile Picture').querySelector('input[type="file"]');
        const mockFile = new File(['(⌐□_□)'], 'test.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
        // Add assertions for image upload behavior
    });

    it('should show snackbar message on successful user edit', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');
        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);
        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('should handle delete user', async () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1);
        setup({ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() });
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should show snackbar message on API error', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');
        const saveButton = screen.getByText('Save');

        // Mock fetch to throw an error
        jest.spyOn(global, 'fetch').mockRejectedValueOnce(new Error('API Error'));

        await userEvent.click(saveButton);
        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('should close the snackbar', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');
        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
