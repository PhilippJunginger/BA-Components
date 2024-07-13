import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { RouterContext } from 'next/dist/shared/lib/router-context';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- promises
- fireEvent

- variable - 5
- typeerror - 3
- const missing - 5
- unnecessary module
- render Funktion

- 8 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -75
Testumfang: 72,15
 */

const testUser: UserWithId = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
};

const testUserProfile: UserProfile = {
    id: '1',
    name: 'Test User',
    email: 'test@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockRouter = {
    push: jest.fn(),
};

const renderComponent = (userProfile?: UserProfile, currentUser?: UserWithId) => {
    return render(
        <RouterContext.Provider value={mockRouter as any}>
            <UserProfileCardSchwer
                userProfile={userProfile || testUserProfile}
                setUserProfile={jest.fn()}
                currentUser={currentUser || testUser}
            />
        </RouterContext.Provider>,
    );
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        fetchMock.resetMocks();
    });

    it('should render user information correctly', () => {
        renderComponent();
        expect(screen.getByText('Test User')).toBeInTheDocument();
        expect(screen.getByText('Email: test@example.com')).toBeInTheDocument();
    });

    it('should expand and collapse the card content', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 3/15/2023')).toBeVisible();

        fireEvent.click(expandButton);
        // Wait for the collapse animation to complete
        // Otherwise the element might still be in the DOM but not visible
        expect(screen.queryByText('Registration Date: 3/15/2023')).not.toBeVisible();
    });

    it('should navigate to the profile page', async () => {
        renderComponent();
        const profilePageButton = screen.getByText('Show Profile Page');
        fireEvent.click(profilePageButton);
        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    it('should toggle edit mode', () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
    });

    it('should edit user information', async () => {
        const setUserProfile = jest.fn();
        renderComponent(testUserProfile, testUser);

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        const emailInput = screen.getByLabelText('Email') as HTMLInputElement;

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'updated@example.com');

        fireEvent.click(screen.getByText('Save'));

        expect(setUserProfile).toHaveBeenCalledWith({
            ...testUserProfile,
            name: 'Updated Name',
            email: 'updated@example.com',
        });
    });

    it('should upload a new profile image', async () => {
        fetchMock.doMockOnceIf('https://example.com/api/upload-image', async () => {
            return {
                body: JSON.stringify({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
                init: { status: 200 },
            };
        });

        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'test-image.png', { type: 'image/png' });
        Object.defineProperty(fileInput, 'files', {
            value: [file],
        });

        fireEvent.change(fileInput);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });
    });

    it('should show snackbar message when image upload fails', async () => {
        fetchMock.doMockOnceIf('https://example.com/api/upload-image', { status: 500 });

        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(⌐□_□)'], 'test-image.png', { type: 'image/png' });
        Object.defineProperty(fileInput, 'files', {
            value: [file],
        });

        fireEvent.change(fileInput);

        expect(await screen.findByText('Failed to upload image')).toBeVisible();
    });

    it('should show snackbar message on successful user edit', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Updated Name');

        fireEvent.click(screen.getByText('Save'));

        expect(await screen.findByText('User edited successfully')).toBeVisible();
    });

    it('should delete user', async () => {
        fetchMock.doMockOnceIf('https://example.com/api/user', { status: 200 });
        const setUserProfile = jest.fn();
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        renderComponent({ ...testUserProfile, registrationDate: oneDayAgo.toISOString() }, testUser, setUserProfile);

        const deleteUserButton = screen.getByText('Delete User');
        fireEvent.click(deleteUserButton);

        // Simulate clicking "OK" on the confirmation dialog
        window.confirm = jest.fn(() => true);

        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });
        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should show snackbar message when user deletion fails', async () => {
        fetchMock.doMockOnceIf('https://example.com/api/user', { status: 500 });
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);
        renderComponent({ ...testUserProfile, registrationDate: oneDayAgo.toISOString() }, testUser);

        const deleteUserButton = screen.getByText('Delete User');
        fireEvent.click(deleteUserButton);

        // Simulate clicking "OK" on the confirmation dialog
        window.confirm = jest.fn(() => true);

        expect(await screen.findByText('Failed to delete user')).toBeVisible();
    });

    it('should disable delete button for recently registered users', () => {
        renderComponent();
        const deleteUserButton = screen.getByText('Delete User');
        expect(deleteUserButton).toBeDisabled();
    });
});
