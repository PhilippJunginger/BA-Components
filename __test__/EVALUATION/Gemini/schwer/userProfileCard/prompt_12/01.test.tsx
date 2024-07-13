import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import { createMemoryRouter } from 'next/navigation';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- node access
- fireEvent

- variable - 4
- typeerror - 5
- render Funktion
- unnecessary module import - 2

- 9 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -60
Testumfang: 83,25
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-16T10:00:00.000Z',
    lastLoginDate: '2023-03-17T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockRouter = {
    push: jest.fn(),
};

const renderComponent = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    return render(
        <RouterContext.Provider value={createMemoryRouter([{ pathname: '/', id: 'index' }])}>
            <UserProfileCardSchwer
                userProfile={userProfile || mockUserProfile}
                setUserProfile={jest.fn()}
                currentUser={currentUser || mockCurrentUser}
            />
        </RouterContext.Provider>,
        { wrapper: RouterContext.Provider },
    );
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(global, 'fetch').mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/updated-profile-image.jpg' }),
        });
    });

    it('should render user profile information correctly', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it('should expand and collapse user profile details', async () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date: 16/03/2023')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 16/03/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 16/03/2023')).not.toBeVisible();
    });

    it('should toggle edit mode and display edit fields', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('should update user profile on edit and save', async () => {
        const setUserProfileMock = jest.fn();
        renderComponent(mockUserProfile, mockCurrentUser);

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

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('should upload new profile image', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });
    });

    it('should handle image upload error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Upload failed'));
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByText('Change Profile Picture').querySelector('input[type="file"]');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('should navigate to user profile page', async () => {
        renderComponent();

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('should delete user after confirmation', async () => {
        const setUserProfileMock = jest.fn();
        const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true);
        renderComponent(mockUserProfile, { ...mockCurrentUser, id: '1' });

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });
        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    it('should not delete user if confirmation is cancelled', async () => {
        const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(false);
        renderComponent();

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(confirmMock).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(fetch).not.toHaveBeenCalled();
    });

    it('should handle user deletion error', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Deletion failed'));
        const confirmMock = jest.spyOn(window, 'confirm').mockReturnValue(true);
        renderComponent();

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('should disable delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setHours(recentRegistrationDate.getHours() - 23);
        renderComponent({ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('should enable delete button for users registered more than 24 hours ago', () => {
        const oldRegistrationDate = new Date();
        oldRegistrationDate.setDate(oldRegistrationDate.getDate() - 2);
        renderComponent({ ...mockUserProfile, registrationDate: oldRegistrationDate.toISOString() });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).not.toBeDisabled();
    });
});
