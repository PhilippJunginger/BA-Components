import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*

- setup
- unused import
- variable - 2

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -20
Testumfang: 60
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    it('should render user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('should toggle edit mode and save changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should expand and collapse additional user information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    it.skip('should delete user if conditions are met', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should not delete user if conditions are not met', async () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        };

        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should close snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
