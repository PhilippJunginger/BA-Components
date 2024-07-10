import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup

- variable - 2

- 3 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -10
CleanCode: -10
Testumfang: 40
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date('2023-07-09T12:34:56Z'),
    lastLoginDate: new Date('2023-07-10T12:34:56Z'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
    department: 'Engineering',
};

describe('UserProfileCardLeicht Component', () => {
    let setUserProfile: jest.Mock;

    beforeEach(() => {
        setUserProfile = jest.fn();
    });

    it('should render the user profile card with user details', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it('should toggle the expansion of additional user details', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
    });

    it('should toggle edit mode and save changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should delete the user if allowed', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();

        // Mock a condition where deletion is allowed (user registered within the last day)
        const recentUserProfile = { ...mockUserProfile, registrationDate: new Date() };
        render(
            <UserProfileCardLeicht
                userProfile={recentUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const enabledDeleteButton = screen.getByText('Delete User');
        expect(enabledDeleteButton).not.toBeDisabled();

        await userEvent.click(enabledDeleteButton);
        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should close the snackbar message', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        // Trigger snackbar message by editing the user
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
