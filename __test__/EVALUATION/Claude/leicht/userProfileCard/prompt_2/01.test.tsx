import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent
- waitFor assertions

- setup
- variable - 1
- render Funktion

- 3 von 5 notwendigem Testumfang erreicht + 5 Redundanz

Best-Practices: -20
CleanCode: -15
Testumfang: 10
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date('2023-01-01'),
        lastLoginDate: new Date('2023-06-01'),
    };
    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
    };
    const mockSetUserProfile = jest.fn();
    const renderComponent = (userProfile = mockUserProfile, currentUser = mockCurrentUser) => {
        return render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
    };
    it('renders user profile information correctly', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('expands and collapses additional information', async () => {
        renderComponent();
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
        });
    });

    it('allows editing when it is the current users profile', async () => {
        const user = userEvent.setup();
        renderComponent();
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

    it('does not show edit and delete buttons for non-current user profiles', () => {
        const nonCurrentUser: UserWithId = { ...mockCurrentUser, id: '2' };
        renderComponent(mockUserProfile, nonCurrentUser);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('disables delete button within 24 hours of registration', () => {
        const recentlyRegisteredUser: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(recentlyRegisteredUser);
        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it('enables delete button after 24 hours of registration', () => {
        const oldUser: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUser);
        expect(screen.getByText('Delete User')).not.toBeDisabled();
    });

    it('calls setUserProfile with undefined when delete button is clicked', async () => {
        const user = userEvent.setup();
        const oldUser: UserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUser);
        const deleteButton = screen.getByText('Delete User');
        await user.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('closes the snackbar when close button is clicked', async () => {
        const user = userEvent.setup();
        renderComponent();
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
