import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- prefer findBy
- render in beforeEach

- variable - 3
- typeerror -


- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -20
Testumfang: 50
 */

describe('UserProfileCardMittel', () => {
    const mockUserProfile: UserProfile = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'http://example.com/profile.jpg',
        registrationDate: '2023-07-01T00:00:00.000Z',
        lastLoginDate: '2023-07-10T00:00:00.000Z',
    };

    const mockCurrentUser: UserWithId = {
        id: '123',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };

    const mockSetUserProfile = jest.fn();

    beforeEach(() => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
    });

    it('should display user profile information', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it('should toggle expand section', () => {
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 7/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 7/10/2023')).toBeInTheDocument();
    });

    it('should toggle edit mode and edit user details', async () => {
        const user = userEvent.setup();
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        expect(nameInput).toHaveValue('Jane Doe');
        expect(emailInput).toHaveValue('jane@example.com');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const user = userEvent.setup();
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');
        Object.defineProperty(fileInput, 'files', { value: [file] });

        fireEvent.change(fileInput);

        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalled());
    });

    it.skip('should show snackbar and close it', async () => {
        const user = userEvent.setup();
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it('should delete user and show snackbar on error', async () => {
        const user = userEvent.setup();
        const deleteButton = screen.getByText('Delete User');

        fireEvent.click(deleteButton);

        await screen.findByText('Failed to delete user');
    });

    it.skip('should disable delete button if user is not deletable', () => {
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
