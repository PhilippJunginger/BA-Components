import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- node access
- render in beforeEach

- variable - 3
- typeerror - 1
- unnecessary waitFor
- unused import


- 4 von 8 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 31,25
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-01-02T00:00:00.000Z',
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

    it('should render the component with user profile details', () => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('should toggle expand/collapse on clicking expand icon', async () => {
        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/2/2023')).toBeInTheDocument();

        await user.click(expandButton);
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 1/2/2023')).not.toBeInTheDocument();
    });

    it('should enter edit mode and save changes', async () => {
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await user.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('should handle snackbar close', async () => {
        const editButton = screen.getByText('Edit');
        await user.click(editButton);
        await user.click(screen.getByText('Save'));

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('should delete user', async () => {
        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it.skip('should disable delete button if user is registered for more than a day', () => {
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
