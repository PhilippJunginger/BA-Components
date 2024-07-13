import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- fireEvent
- node access

- typeerror - 3
- variable - 3


- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -20
Testumfang: 50
 */

const user: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const userProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-04-01T10:00:00.000Z',
    lastLoginDate: '2023-04-05T12:00:00.000Z',
};

describe('UserProfileCardMittel', () => {
    it('renders user profile information correctly', () => {
        render(<UserProfileCardMittel userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />);

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        render(<UserProfileCardMittel userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />);

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date:')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();
    });

    it('toggles edit mode and saves changes', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={setUserProfileMock} currentUser={user} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updated@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfile,
            name: 'Updated Name',
            email: 'updated@example.com',
        });
    });

    it.skip('uploads new profile image', async () => {
        const file = new File([''], 'test-image.jpg', { type: 'image/jpeg' });
        const setUserProfileMock = jest.fn();
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-image.jpg' }),
        });

        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={setUserProfileMock} currentUser={user} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const imageUploadInput = screen.getByLabelText('Change Profile Picture').querySelector('input[type="file"]');
        fireEvent.change(imageUploadInput!, { target: { files: [file] } });

        expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Wait for the image upload to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfile,
            profileImageUrl: 'https://example.com/new-image.jpg',
        });

        fetchMock.mockRestore();
    });

    it('shows snackbar message on successful user edit', async () => {
        const setUserProfileMock = jest.fn();
        render(
            <UserProfileCardMittel userProfile={userProfile} setUserProfile={setUserProfileMock} currentUser={user} />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('deletes user', async () => {
        const setUserProfileMock = jest.fn();
        const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
        });

        render(
            <UserProfileCardMittel
                userProfile={{ ...userProfile, registrationDate: '2023-04-07T10:00:00.000Z' }}
                setUserProfile={setUserProfileMock}
                currentUser={user}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        // Wait for the user deletion to complete
        await new Promise((resolve) => setTimeout(resolve, 0));

        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);

        fetchMock.mockRestore();
    });

    it.skip('disables delete button for recently registered users', () => {
        render(<UserProfileCardMittel userProfile={userProfile} setUserProfile={() => {}} currentUser={user} />);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
