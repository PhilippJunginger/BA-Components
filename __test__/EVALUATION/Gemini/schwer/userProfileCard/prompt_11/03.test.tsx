import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- node access

- unused import
- variable - 5
- typeerror - 6
- render Funktion
- unnecessary module import

- 7 von 9 notwendigem Testumfang erreicht + 6 Redundanz

Best-Practices: -30
CleanCode: -70
Testumfang: 44,4
*/

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-04-01T10:00:00.000Z',
    lastLoginDate: '2023-04-05T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const mockRouter = {
    push: jest.fn(),
};

const renderComponent = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    render(
        <RouterContext.Provider value={mockRouter as any}>
            <UserProfileCardSchwer
                userProfile={userProfile || mockUserProfile}
                setUserProfile={jest.fn()}
                currentUser={currentUser || mockCurrentUser}
            />
        </RouterContext.Provider>,
    );
};

global.fetch = jest.fn(() =>
    Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
    }),
) as jest.Mock;

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information correctly', () => {
        renderComponent();

        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it('should expand and collapse the card content', async () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 04/01/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 04/05/2023')).toBeVisible();

        await userEvent.click(expandButton);

        expect(screen.queryByText('Registration Date: 04/01/2023')).not.toBeVisible();
    });

    it('should toggle edit mode and display edit fields', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

        await userEvent.click(editButton);

        expect(screen.queryByLabelText('Name')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
        expect(screen.queryByText('Change Profile Picture')).not.toBeInTheDocument();
    });

    it('should update user profile on edit and save', async () => {
        const setUserProfile = jest.fn();
        renderComponent(mockUserProfile, mockCurrentUser);

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, ' Edited');
        await userEvent.type(emailInput, 'edited@example.com');

        await userEvent.click(editButton);

        expect(setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Test User Edited',
            email: 'testedited@example.com',
        });
    });

    it('should handle image upload', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByText('Change Profile Picture').querySelector('input[type="file"]')!;
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });
    });

    it('should handle image upload error', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Upload failed')));

        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByText('Change Profile Picture').querySelector('input[type="file"]')!;
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        expect(screen.getByText('Failed to upload image')).toBeVisible();
    });

    it('should navigate to profile page', async () => {
        renderComponent();

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('should delete user on confirmation', async () => {
        const setUserProfile = jest.fn();
        const userProfile = { ...mockUserProfile, registrationDate: '2023-04-07T10:00:00.000Z' };
        renderComponent(userProfile, mockCurrentUser);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();

        window.confirm = jest.fn(() => true);
        await userEvent.click(deleteButton);

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });
        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should handle user deletion error', async () => {
        (fetch as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('Deletion failed')));
        const userProfile = { ...mockUserProfile, registrationDate: '2023-04-07T10:00:00.000Z' };
        renderComponent(userProfile, mockCurrentUser);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeEnabled();

        window.confirm = jest.fn(() => true);
        await userEvent.click(deleteButton);

        expect(screen.getByText('Failed to delete user')).toBeVisible();
    });

    it('should disable delete button for recently registered users', () => {
        const userProfile = { ...mockUserProfile, registrationDate: new Date().toISOString() };
        renderComponent(userProfile, mockCurrentUser);

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('should show snackbar on successful user edit', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');

        await userEvent.click(editButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('should close the snackbar', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.type(nameInput, ' Edited');

        await userEvent.click(editButton);

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
