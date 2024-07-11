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

- 3 von 5 notwendigem Testumfang erreicht + 7 Redundanz

Best-Practices: -30
CleanCode: -10
Testumfang: -10
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'http://example.com/profile.jpg',
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

    const renderComponent = (userProfile = mockUserProfile, currentUser = mockCurrentUser) => {
        return render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it('toggles expanded view when expand button is clicked', async () => {
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

    it('shows edit and delete buttons for current user profile', () => {
        renderComponent();
        expect(screen.getByText('Edit')).toBeInTheDocument();
        expect(screen.getByText('Delete User')).toBeInTheDocument();
    });

    it('does not show edit and delete buttons for other user profiles', () => {
        const otherUser: UserWithId = { ...mockCurrentUser, id: '2' };
        renderComponent(mockUserProfile, otherUser);
        expect(screen.queryByText('Edit')).not.toBeInTheDocument();
        expect(screen.queryByText('Delete User')).not.toBeInTheDocument();
    });

    it('enters edit mode when Edit button is clicked', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');

        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toHaveValue(mockUserProfile.name);
        expect(screen.getByLabelText('Email')).toHaveValue(mockUserProfile.email);
        expect(screen.getByText('Save')).toBeInTheDocument();
    });

    it('updates user profile when Save button is clicked', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane@example.com',
            }),
        );
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('disables Delete User button if user registered more than 24 hours ago', () => {
        const oldUser = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
        };
        renderComponent(oldUser);
        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('enables Delete User button if user registered less than 24 hours ago', () => {
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(newUser);
        expect(screen.getByText('Delete User')).not.toBeDisabled();
    });

    it.skip('calls setUserProfile with undefined when Delete User is clicked', async () => {
        const newUser = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 23 * 60 * 60 * 1000), // 23 hours ago
        };
        renderComponent(newUser);
        const deleteButton = screen.getByText('Delete User');

        await userEvent.click(deleteButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('closes snackbar when close button is clicked', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
