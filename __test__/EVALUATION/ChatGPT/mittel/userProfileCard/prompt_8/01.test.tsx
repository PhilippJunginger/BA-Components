import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile, UserWithId } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*


- setup
- variable -
- typeerror -
- unnecessary waitFor - 2
- unused import


- 4 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 37,5
 */

describe('UserProfileCardMittel Component', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const setUserProfile = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information', () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );

        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('should toggle edit mode and update user profile', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByLabelText(/name/i);
        const emailInput = screen.getByLabelText(/email/i);

        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');
        await user.clear(emailInput);
        await user.type(emailInput, 'jane.doe@example.com');

        await user.click(screen.getByRole('button', { name: /save/i }));

        expect(setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should handle image upload', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText(/change profile picture/i);

        await user.upload(fileInput, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalled();
        });
    });

    it.skip('should handle delete user', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const deleteButton = screen.getByRole('button', { name: /delete user/i });
        await user.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('should expand and collapse additional information', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const expandButton = screen.getByLabelText(/show more/i);
        await user.click(expandButton);

        expect(screen.getByText(/registration date/i)).toBeInTheDocument();
        expect(screen.getByText(/last login date/i)).toBeInTheDocument();

        await user.click(expandButton);

        expect(screen.queryByText(/registration date/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/last login date/i)).not.toBeInTheDocument();
    });

    it('should show snackbar message and close it', async () => {
        render(
            <UserProfileCardMittel
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const user = userEvent.setup();

        const editButton = screen.getByRole('button', { name: /edit/i });
        await user.click(editButton);

        const nameInput = screen.getByLabelText(/name/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        await user.click(screen.getByRole('button', { name: /save/i }));

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByLabelText(/close/i);
        await user.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
