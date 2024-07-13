import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- fireEvent
- node access

- typeerror - 2
- variable - 2
- date creation


- 7 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -25
Testumfang: 75
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
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

const renderComponent = (userProfile = mockUserProfile, currentUser = mockCurrentUser) => {
    render(
        <UserProfileCardMittel
            userProfile={userProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={currentUser}
        />,
    );
};

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it.skip('should expand and collapse user details', async () => {
        renderComponent();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        fireEvent.click(expandButton);
        expect(
            screen.getByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).toBeVisible();
        expect(
            screen.getByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeVisible();

        fireEvent.click(expandButton);
        expect(
            screen.queryByText(`Registration Date: ${new Date(mockUserProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeVisible();
        expect(
            screen.queryByText(`Last Login Date: ${new Date(mockUserProfile.lastLoginDate).toLocaleDateString()}`),
        ).not.toBeVisible();
    });

    it('should toggle edit mode', () => {
        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editButton);
        expect(screen.getByRole('textbox', { name: 'Name' })).toBeVisible();
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeVisible();
        expect(screen.getByText('Change Profile Picture')).toBeVisible();
    });

    it.skip('should edit user profile', async () => {
        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await userEvent.type(nameInput, ' Jane');
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'John Doe Jane',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('should handle image upload', async () => {
        const mockFile = new File([''], 'profile-image.jpg', { type: 'image/jpeg' });
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editButton);

        const imageUploadButton = screen.getByText('Change Profile Picture');
        const input = imageUploadButton.parentNode?.querySelector('input') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [mockFile] } });

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Wait for the state update
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });

        mockFetch.mockRestore();
    });

    it('should show snackbar message on successful user edit', async () => {
        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        fireEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.type(nameInput, ' Jane');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        fireEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it.skip('should disable delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1);

        renderComponent({ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() });

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);

        renderComponent({ ...mockUserProfile, registrationDate: oldRegistrationDate.toISOString() });

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeEnabled();
    });

    it.skip('should handle user deletion', async () => {
        const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        renderComponent();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        fireEvent.click(deleteButton);

        expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: mockUserProfile.id }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);

        mockFetch.mockRestore();
    });
});
