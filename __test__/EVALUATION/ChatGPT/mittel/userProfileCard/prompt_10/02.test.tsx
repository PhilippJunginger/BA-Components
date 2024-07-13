import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireevent
- render in beforeEach
- waitFor assertions

- setup
- variable - 3
- typeerror
- unnecessary waitFor - 2


- 4 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -35
Testumfang: 43,75
 */

describe('UserProfileCardMittel Component', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/image.jpg',
        registrationDate: '2024-07-10T00:00:00.000Z',
        lastLoginDate: '2024-07-11T00:00:00.000Z',
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password',
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

    it('should display user profile information correctly', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/image.jpg');
    });

    it('should expand and collapse user details', async () => {
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(screen.getByText('Registration Date: 7/10/2024')).toBeInTheDocument();
            expect(screen.getByText('Last Login Date: 7/11/2024')).toBeInTheDocument();
        });

        fireEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.queryByText('Registration Date: 7/10/2024')).not.toBeInTheDocument();
            expect(screen.queryByText('Last Login Date: 7/11/2024')).not.toBeInTheDocument();
        });
    });

    it('should enter edit mode and update user profile', async () => {
        const user = userEvent.setup();
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it('should show snackbar with error message for large image upload', async () => {
        const user = userEvent.setup();
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const largeFile = new File([new Uint8Array(1048577)], 'largeImage.jpg', { type: 'image/jpeg' });

        Object.defineProperty(fileInput, 'files', {
            value: [largeFile],
        });

        fireEvent.change(fileInput);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    it.skip('should delete user', async () => {
        const user = userEvent.setup();
        const deleteButton = screen.getByText('Delete User');

        await user.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });
});
