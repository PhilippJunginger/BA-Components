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
- unnecessary Date call

- 3 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: 0
CleanCode: -25
Testumfang: 30
 */

const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-07-01'),
};

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

describe('UserProfileCardLeicht', () => {
    const setUserProfile = jest.fn();

    beforeEach(() => {
        setUserProfile.mockClear();
    });

    test('renders user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toHaveAttribute(
            'src',
            userProfile.profileImageUrl,
        );
    });

    test.skip('toggles edit mode and saves changes', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByText('Save'));

        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: jane.doe@example.com')).toBeInTheDocument();
    });

    test('expands and collapses additional information', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
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

    test('displays snackbar on successful edit', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await user.click(screen.getByText('Edit'));
        await user.type(screen.getByLabelText('Name'), 'Jane Doe');
        await user.click(screen.getByText('Save'));

        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });

    test('deletes user profile', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    test.skip('delete button is disabled if user registered more than 24 hours ago', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
