import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- render in beforeEach

- variable - 2
- typeerror
- unnecessary waitFOr - 2
- unused import



- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -30
Testumfang: 50
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-01-10T00:00:00.000Z',
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

    it('should toggle edit mode', async () => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();

        await user.click(editButton);
        expect(screen.queryByLabelText(/name/i)).not.toBeInTheDocument();
        expect(screen.queryByLabelText(/email/i)).not.toBeInTheDocument();
    });

    it('should update user profile on save', async () => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(editButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should expand and collapse additional user information', async () => {
        const expandButton = screen.getByLabelText(/show more/i);
        await user.click(expandButton);

        expect(screen.getByText(/registration date/i)).toBeInTheDocument();
        expect(screen.getByText(/last login date/i)).toBeInTheDocument();

        await user.click(expandButton);
        expect(screen.queryByText(/registration date/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/last login date/i)).not.toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);

        await user.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('should handle snackbar close', async () => {
        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);
        await user.click(editButton);

        const closeButton = screen.getByLabelText(/close/i);
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('should delete user', async () => {
        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });
});
