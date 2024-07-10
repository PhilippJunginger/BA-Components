import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*


- variable - 2
- unused import

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -15
Testumfang: 60
 */

describe('UserProfileCardLeicht Component', () => {
    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'http://example.com/john.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const setUserProfileMock = jest.fn();

    beforeEach(() => {
        setUserProfileMock.mockClear();
    });

    it('should render the user profile', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /user profile image/i })).toBeInTheDocument();
    });

    it('should toggle edit mode and save changes', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByText('Save'));

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should delete the user profile', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');

        expect(deleteButton).not.toBeDisabled();

        await user.click(deleteButton);

        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    it.skip('should not delete the user profile if more than a day has passed since registration', () => {
        const olderUserProfile = {
            ...userProfile,
            registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        };

        render(
            <UserProfileCardLeicht
                userProfile={olderUserProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');

        expect(deleteButton).toBeDisabled();
    });

    it('should expand and collapse additional user info', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');

        await user.click(expandButton);

        expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date/i)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date/i)).not.toBeInTheDocument();
    });

    it.skip('should close the snackbar when the close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfileMock}
                currentUser={currentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));
        await user.click(screen.getByText('Save'));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        await user.click(screen.getByLabelText('close'));

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
