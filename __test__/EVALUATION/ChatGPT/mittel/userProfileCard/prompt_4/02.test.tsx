import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*

- render Funktion
- setup
- variable - 2
- typeerror - 1
- unnecessary waitFor
- unused import
- unnecessary mock


- 5 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: 0
CleanCode: -40
Testumfang: 56,25
 */

jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    Snackbar: ({ open, message, action }: any) =>
        open ? (
            <div>
                {message}
                {action}
            </div>
        ) : null,
}));

describe('UserProfileCardMittel Component', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const mockSetUserProfile = jest.fn();

    const setup = () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
    };

    it('should render the component with user profile details', () => {
        setup();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('should toggle edit mode when edit button is clicked', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should save edited user details and show snackbar message', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should handle image upload and show snackbar message on failure', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');
        Object.defineProperty(fileInput, 'files', {
            value: [file],
        });

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('should delete user and show snackbar message on failure', async () => {
        setup();
        const user = userEvent.setup();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });

    it('should expand and collapse additional user details', async () => {
        setup();
        const user = userEvent.setup();

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });
});
