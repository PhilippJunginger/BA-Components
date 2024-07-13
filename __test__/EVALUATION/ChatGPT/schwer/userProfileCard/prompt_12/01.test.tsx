import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*

- setup
- type error - 1
- render Funktion
- unnecessary waitFor - 2
- unused import

- 5 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: 0
CleanCode: -30
Testumfang: 44,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

describe('UserProfileCardSchwer Component', () => {
    const currentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };

    const userProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const setUserProfile = jest.fn();

    const setup = () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
    };

    it('should render user profile details', () => {
        setup();
        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
    });

    it.skip('should toggle edit mode', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(setUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: userProfile.name,
                email: userProfile.email,
            }),
        );
    });

    it('should handle profile page navigation', async () => {
        setup();
        const user = userEvent.setup();

        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);

        const profilePageButton = screen.getByText('Show Profile Page');
        await user.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfile.id}`);
    });

    it.skip('should handle image upload', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await user.upload(input, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('should handle snackbar close', async () => {
        setup();
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it.skip('should handle user deletion', async () => {
        setup();
        const user = userEvent.setup();

        window.confirm = jest.fn().mockImplementation(() => true);

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('should disable delete button if user registered within a day', () => {
        setup();
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
