import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react-dom/test-utils';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent
- node access
- wrap with act

- variable - 4
- typeerror - 1
- render Funktion

- 4 von 9 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -40
CleanCode: -30
Testumfang: 38,85
 */

const userProfileData: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-17T10:00:00.000Z',
    lastLoginDate: '2023-03-18T10:00:00.000Z',
};

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

jest.mock('next/router', () => ({
    useRouter: () => ({
        push: jest.fn(),
    }),
}));

// Mock fetch API
global.fetch = jest.fn();

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfileData}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('expands and collapses the card content', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfileData}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Show Profile Page')).toBeVisible();
        expect(screen.getByText('Registration Date: 3/17/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 3/18/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Show Profile Page')).not.toBeVisible();
        expect(screen.queryByText('Registration Date: 3/17/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 3/18/2023')).not.toBeVisible();
    });

    it('toggles edit mode and updates user profile', async () => {
        render(
            <UserProfileCardSchwer
                userProfile={userProfileData}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfileData,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it.skip('uploads a new profile image', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
        });

        render(
            <UserProfileCardSchwer
                userProfile={userProfileData}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen
            .getByLabelText('Change Profile Picture')
            .querySelector('input[type="file"]') as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'profile-image.jpg', { type: 'image/jpeg' });
        await act(async () => {
            fireEvent.change(fileInput, { target: { files: [file] } });
        });

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...userProfileData,
            profileImageUrl: 'https://example.com/new-profile-image.jpg',
        });
    });

    it('deletes the user profile', async () => {
        // Mock the window.confirm method to return true
        window.confirm = jest.fn(() => true);

        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        render(
            <UserProfileCardSchwer
                userProfile={userProfileData}
                setUserProfile={mockSetUserProfile}
                currentUser={currentUser}
            />,
        );

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: userProfileData.id }),
        });

        expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
    });
});
