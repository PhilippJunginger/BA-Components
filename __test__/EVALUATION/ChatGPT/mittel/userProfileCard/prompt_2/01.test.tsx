import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- interface usage

- variable - 1
- typeerror - 1
- unnecessary waitFor
- props spreading
- setup

- 4 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 37,5
 */

jest.mock('fetch');

describe('UserProfileCardMittel', () => {
    const currentUser = {
        id: '1',
        name: 'Current User',
        email: 'current.user@example.com',
        password: 'password',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockSetUserProfile = jest.fn();

    const defaultProps: any = {
        userProfile,
        setUserProfile: mockSetUserProfile,
        currentUser,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render component with user profile', () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    it('should toggle expand and collapse details', () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date/i)).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date/i)).not.toBeInTheDocument();
    });

    it('should enter and save edit mode', async () => {
        const user = userEvent.setup();
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toHaveValue(userProfile.name);
        expect(emailInput).toHaveValue(userProfile.email);

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should handle image upload', async () => {
        const user = userEvent.setup();
        render(<UserProfileCardMittel {...defaultProps} />);

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await user.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it('should handle delete user', async () => {
        const user = userEvent.setup();
        render(<UserProfileCardMittel {...defaultProps} />);

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('should show snackbar message and close', async () => {
        render(<UserProfileCardMittel {...defaultProps} />);

        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Save'));

        const snackbarCloseButton = screen.getByLabelText('close');
        expect(snackbarCloseButton).toBeInTheDocument();

        fireEvent.click(snackbarCloseButton);
        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
