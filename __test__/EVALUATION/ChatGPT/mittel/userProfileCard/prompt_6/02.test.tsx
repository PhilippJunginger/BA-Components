import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- setup

- variable - 3
- typeerror - 6
- unnecessary waitFor - 3


- 5 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -60
Testumfang: 56,25
 */

const currentUser: UserWithId = {
    id: '1',
    name: 'Current User',
    email: 'currentuser@example.com',
    password: 'password',
};

const userProfile = {
    id: '1',
    name: 'Jane Doe',
    email: 'jane.doe@example.com',
    profileImageUrl: 'profile.jpg',
    registrationDate: '2022-07-01',
    lastLoginDate: '2022-07-10',
};

const setUserProfile = jest.fn();

describe('UserProfileCardMittel', () => {
    it.skip('should display user information correctly', () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('Jane Doe')).toBeInTheDocument();
        expect(screen.getByText('jane.doe@example.com')).toBeInTheDocument();
    });

    it('should toggle edit mode and edit user details', async () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const editButton = screen.getByText('Edit');

        await userEvent.click(editButton);
        expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument();
        expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'john.doe@example.com' } });

        await userEvent.click(screen.getByText('Save'));
        expect(setUserProfile).toHaveBeenCalledWith(
            expect.objectContaining({ name: 'John Doe', email: 'john.doe@example.com' }),
        );
    });

    it('should handle image upload correctly', async () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });

        await userEvent.click(screen.getByText('Edit'));
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({ profileImageUrl: expect.any(String) }),
            );
        });
    });

    it('should display snackbar message on successful edit', async () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );

        await userEvent.click(screen.getByText('Edit'));
        const nameInput = screen.getByLabelText('Name');
        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it('should expand and collapse additional user info', async () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const expandButton = screen.getByRole('button', { name: /show more/i });

        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date/i)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date/i)).not.toBeInTheDocument();
    });

    it.skip('should handle user deletion', async () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfile}
                setUserProfile={setUserProfile}
                currentUser={currentUser}
            />,
        );
        const deleteButton = screen.getByText('Delete User');

        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });
});
