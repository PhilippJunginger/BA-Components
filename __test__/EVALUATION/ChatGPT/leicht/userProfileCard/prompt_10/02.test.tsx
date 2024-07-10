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
- variable - 1
- unnecessary Date call

- 3 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -20
Testumfang: 30
 */

describe('UserProfileCardLeicht Component', () => {
    const mockSetUserProfile = jest.fn();
    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date('2023-07-01T00:00:00Z'),
        lastLoginDate: new Date('2023-07-05T00:00:00Z'),
    };
    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password',
        department: 'Engineering',
    };

    it('renders user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it('toggles edit mode and edits user information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands and collapses the user profile details', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const user = userEvent.setup();

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
        expect(
            screen.queryByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('deletes the user profile', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const user = userEvent.setup();

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables delete button if registration time exceeds 24 hours', () => {
        const oldUserProfile = {
            ...userProfile,
            registrationDate: new Date('2023-06-01T00:00:00Z'),
        };

        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: 'Delete User' });

        expect(deleteButton).toBeDisabled();
    });

    it.skip('closes the snackbar message', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: 'Edit' }));
        await user.click(screen.getByRole('button', { name: 'Save' }));

        const closeButton = screen.getByRole('button', { name: /close/i });
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
