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
- unnecessary date creation

- 3 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -25
Testumfang: 40
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

    it('should render user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: testuser@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', userProfile.profileImageUrl);
    });

    it('should toggle edit mode and save changes', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await user.clear(nameInput);
        await user.type(nameInput, 'Updated User');
        await user.clear(emailInput);
        await user.type(emailInput, 'updateduser@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Updated User',
            email: 'updateduser@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should expand and collapse additional information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        await user.click(expandButton);
        expect(
            screen.queryByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it.skip('should delete user profile', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should close snackbar', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: 'Edit' });
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Updated User');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await user.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
