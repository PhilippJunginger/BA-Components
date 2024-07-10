import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent

- variable - 2
- setup

- 3 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -10
CleanCode: -15
Testumfang: 30
 */

const mockSetUserProfile = jest.fn();

const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    lastLoginDate: new Date(),
};

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

describe('UserProfileCardLeicht Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render the component with user profile data', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'https://example.com/profile.jpg');
    });

    it.skip('should toggle expand/collapse on clicking the expand button', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        expect(
            screen.getByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${new Date(userProfile.lastLoginDate).toLocaleDateString()}`),
        ).toBeInTheDocument();

        fireEvent.click(expandButton);
        expect(
            screen.queryByText(`Registration Date: ${new Date(userProfile.registrationDate).toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it('should enter edit mode and save changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
        const user = userEvent.setup();

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('should delete the user profile if conditions are met', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
        const user = userEvent.setup();

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('should disable delete button if user registered more than a day ago', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('should close the snackbar when close button is clicked', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
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
