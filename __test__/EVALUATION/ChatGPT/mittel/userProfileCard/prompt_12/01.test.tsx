import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- render in beforeEach
- node access
- condition inside test

- variable - 3
- typeerror - 2
- unnecessary waitFOr - 2
- unused import



- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -40
Testumfang: 50
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2023-01-10T00:00:00Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel Component', () => {
    const user = userEvent.setup();

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
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it.skip('should toggle edit mode', async () => {
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Change Profile Picture' })).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(mockSetUserProfile).toHaveBeenCalledWith(mockUserProfile);
    });

    it('should expand and collapse additional user information', async () => {
        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/10/2023')).toBeInTheDocument();

        await user.click(expandButton);
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
    });

    it.skip('should handle image upload', async () => {
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');

        if (input) {
            await user.upload(input, file);
        }

        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalled());
    });

    it('should show snackbar message on successful edit', async () => {
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        await user.click(screen.getByRole('button', { name: 'Save' }));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should handle delete user', async () => {
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        await waitFor(() => expect(mockSetUserProfile).toHaveBeenCalledWith(undefined));
    });

    it('should close snackbar message', async () => {
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        await user.click(screen.getByRole('button', { name: 'Save' }));
        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
