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
- setup

- 2 von 5 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: 0
CleanCode: -20
Testumfang: 0
 */

describe('UserProfileCardLeicht Component', () => {
    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
        department: 'Engineering',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        profileImageUrl: 'http://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01'),
        lastLoginDate: new Date('2023-06-01'),
    };

    const setUserProfile = jest.fn();

    it('renders user profile details correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        expect(screen.getByText('Email: jane.smith@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode and allows editing of user details', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /Edit/i }));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByRole('button', { name: /Save/i }));

        expect(setUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands and collapses user details on expand button click', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const user = userEvent.setup();

        await user.click(screen.getByLabelText('show more'));

        expect(screen.getByText(/Registration Date:/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/i)).toBeInTheDocument();

        await user.click(screen.getByLabelText('show more'));

        expect(screen.queryByText(/Registration Date:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/i)).not.toBeInTheDocument();
    });

    it.skip('deletes user profile if registered within 24 hours', async () => {
        const recentUserProfile = {
            ...userProfile,
            registrationDate: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        };

        render(
            <UserProfileCardLeicht
                userProfile={recentUserProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /Delete User/i }));

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables delete button if user registered more than 24 hours ago', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByRole('button', { name: /Delete User/i });

        expect(deleteButton).toBeDisabled();
    });

    it('closes snackbar on close button click', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const user = userEvent.setup();

        await user.click(screen.getByRole('button', { name: /Edit/i }));
        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.click(screen.getByRole('button', { name: /Save/i }));

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
