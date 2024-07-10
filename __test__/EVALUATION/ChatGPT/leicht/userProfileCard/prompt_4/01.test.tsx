import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent
- setup

- variable - 2

- 3 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -10
Testumfang: 30
 */

describe('UserProfileCardLeicht Component', () => {
    const mockSetUserProfile = jest.fn();
    const currentUser: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'currentuser@example.com',
        password: 'password123',
    };
    const userProfile: UserProfile = {
        id: '1',
        name: 'Test User',
        email: 'testuser@example.com',
        profileImageUrl: 'https://via.placeholder.com/150',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    beforeEach(() => {
        mockSetUserProfile.mockClear();
    });

    it('should render the component with user profile details', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: testuser@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it.skip('should toggle expand/collapse on expand button click', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        fireEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    it('should toggle edit mode and save changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, ' Edited');
        await userEvent.type(emailInput, '.edited');

        fireEvent.click(screen.getByText('Save'));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Test User Edited',
            email: 'testuser@example.com.edited',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should delete user if delete button is clicked and user can be deleted', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should not delete user if user cannot be deleted', () => {
        const oldUserProfile = {
            ...userProfile,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days old
        };
        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should close snackbar when close button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Save'));

        const closeButton = screen.getByLabelText('close');
        fireEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
