import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- waitFor assertions
- setup
- fireEvent

- variable - 1
- unnecessary faketimers


- 5 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -10
Testumfang: 70
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date('2023-01-01'),
    lastLoginDate: new Date('2023-05-01'),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

describe('UserProfileCardLeicht', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date('2023-05-02'));
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('expands and collapses additional information', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(
                screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
            expect(
                screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
            ).toBeInTheDocument();
        });

        fireEvent.click(expandButton);

        await waitFor(() => {
            expect(
                screen.queryByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
            ).not.toBeInTheDocument();
            expect(
                screen.queryByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
            ).not.toBeInTheDocument();
        });
    });

    it.skip('allows editing user profile when it belongs to the current user', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('disables delete button within 24 hours of registration', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('enables delete button after 24 hours of registration', () => {
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date('2023-04-30'),
        };

        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();
    });

    it.skip('calls setUserProfile with undefined when delete button is clicked', async () => {
        const user = userEvent.setup();
        const oldUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date('2023-04-30'),
        };

        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('does not show edit and delete buttons for non-current user profiles', () => {
        const nonCurrentUser: UserWithId = {
            ...mockCurrentUser,
            id: '2',
        };

        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={nonCurrentUser}
            />,
        );

        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it.skip('closes the snackbar when the close button is clicked', async () => {
        const user = userEvent.setup();
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await user.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await user.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close');
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
