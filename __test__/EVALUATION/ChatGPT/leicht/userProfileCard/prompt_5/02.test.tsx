import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- fireEvent
- setup

- render Funktion
- variable - 2
- unused import
- unnecessary waitFor - 2

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -30
Testumfang: 60
 */

describe('UserProfileCardLeicht', () => {
    const mockSetUserProfile = jest.fn();

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'Current User',
        email: 'current@example.com',
        password: 'password',
        department: 'Engineering',
    };

    const mockUserProfile: UserProfile = {
        id: '2',
        name: 'Test User',
        email: 'test@example.com',
        profileImageUrl: 'test-image-url.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const renderComponent = (userProfile = mockUserProfile, currentUser = mockCurrentUser) => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );
    };

    it('renders user profile information correctly', () => {
        renderComponent();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'test-image-url.jpg');
    });

    it.skip('toggles edit mode and updates user information', async () => {
        renderComponent();

        const editButton = screen.getByRole('button', { name: /Edit/i });
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toHaveValue('Test User');
        expect(screen.getByLabelText('Email')).toHaveValue('test@example.com');

        await userEvent.clear(screen.getByLabelText('Name'));
        await userEvent.type(screen.getByLabelText('Name'), 'Updated User');
        await userEvent.clear(screen.getByLabelText('Email'));
        await userEvent.type(screen.getByLabelText('Email'), 'updated@example.com');

        await userEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() =>
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Updated User',
                email: 'updated@example.com',
            }),
        );

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('expands and collapses additional user information', async () => {
        renderComponent();

        const expandButton = screen.getByRole('button', { name: /show more/i });
        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/i)).toBeInTheDocument();

        await userEvent.click(expandButton);

        expect(screen.queryByText(/Registration Date:/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/i)).not.toBeInTheDocument();
    });

    it.skip('deletes the user when delete button is clicked and deletion is allowed', async () => {
        const recentDate = new Date();
        recentDate.setDate(recentDate.getDate() - 1);
        const mockRecentUserProfile = {
            ...mockUserProfile,
            registrationDate: recentDate,
        };

        renderComponent(mockRecentUserProfile);

        const deleteButton = screen.getByRole('button', { name: /Delete User/i });
        expect(deleteButton).not.toBeDisabled();

        await userEvent.click(deleteButton);
        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables delete button if user was registered less than 24 hours ago', () => {
        renderComponent();

        const deleteButton = screen.getByRole('button', { name: /Delete User/i });
        expect(deleteButton).toBeDisabled();
    });

    it.skip('closes snackbar when close button is clicked', async () => {
        renderComponent();

        await userEvent.click(screen.getByRole('button', { name: /Edit/i }));
        await userEvent.click(screen.getByRole('button', { name: /Save/i }));

        await screen.findByText('User edited successfully');

        const closeButton = screen.getByRole('button', { name: /close/i });
        await userEvent.click(closeButton);

        await waitFor(() => expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument());
    });
});
