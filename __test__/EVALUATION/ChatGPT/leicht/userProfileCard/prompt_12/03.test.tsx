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

describe('UserProfileCardLeicht Component', () => {
    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01'),
        lastLoginDate: new Date('2023-01-10'),
    };

    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const setUserProfile = jest.fn();

    it('should render user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('should toggle edit mode and save changes', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByRole('button', { name: /save/i }));

        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should expand and collapse additional information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText(/show more/i);
        await user.click(expandButton);

        expect(screen.getByText(/registration date/i)).toBeInTheDocument();
        expect(screen.getByText(/last login date/i)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText(/registration date/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/last login date/i)).not.toBeInTheDocument();
    });

    it('should delete user if allowed', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should not delete user if not allowed', () => {
        const recentUserProfile = {
            ...userProfile,
            registrationDate: new Date(),
        };

        render(
            <UserProfileCardLeicht
                userProfile={recentUserProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should close snackbar message', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);
        await user.click(editButton);

        const closeButton = screen.getByLabelText(/close/i);
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
