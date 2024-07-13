import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- render in beforeEach
- promises
- setup

- variable - 3
- typeerror
- unnecessary waitFOr - 3
- unused import



- 6 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -40
Testumfang: 68,75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2022-01-01T00:00:00.000Z',
    lastLoginDate: '2022-01-02T00:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
    });

    it('renders user profile information', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('saves edited user profile', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands and collapses additional user information', async () => {
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 1/1/2022')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/2/2022')).toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 1/1/2022')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 1/2/2022')).not.toBeInTheDocument();
    });

    it('handles image upload', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('handles snackbar close', async () => {
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('handles user deletion', async () => {
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });
});
