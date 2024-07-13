import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- node access
- interface usage

- variable - 4
- typeerror - 5
- render Funktion
- props spreading

- 6 von 9 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -30
CleanCode: -55
Testumfang: 44,4
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-image.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T10:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const mockRouter = {
    push: jest.fn(),
};

jest.mock('next/router', () => ({
    useRouter: () => mockRouter,
}));

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderComponent = (props?: any) => {
        return render(
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                currentUser={mockCurrentUser}
                setUserProfile={mockSetUserProfile}
                {...props}
            />,
        );
    };

    it('renders user profile information correctly', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute(
            'src',
            'https://example.com/profile-image.jpg',
        );
    });

    it.skip('expands and collapses additional information', async () => {
        renderComponent();

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date:')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date:')).not.toBeVisible();
    });

    it.skip('navigates to the user profile page', async () => {
        renderComponent();

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        expect(mockRouter.push).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
    });

    describe('Edit Mode', () => {
        it('toggles edit mode', async () => {
            renderComponent();

            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);

            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
        });

        it('updates user information', async () => {
            renderComponent();

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
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        it.skip('uploads a new profile image', async () => {
            const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: async () => ({ profileImageUrl: 'https://example.com/new-profile-image.jpg' }),
            });

            renderComponent();

            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);

            const fileInput = screen.getByText('Change Profile Picture').querySelector('input');
            const mockFile = new File([''], 'new-profile-image.jpg', { type: 'image/jpeg' });
            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });

            fireEvent.change(fileInput);

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData),
            });

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-profile-image.jpg',
            });

            mockFetch.mockRestore();
        });

        it('shows error message for large file uploads', async () => {
            renderComponent();

            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);

            const fileInput = screen.getByText('Change Profile Picture').querySelector('input');
            const mockFile = new File([''], 'large-image.jpg', { type: 'image/jpeg' });
            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });
            Object.defineProperty(mockFile, 'size', { value: 2 * 1048576 }); // 2MB

            fireEvent.change(fileInput);

            expect(screen.getByText('File size should be less than 1MB')).toBeVisible();
        });
    });

    describe('Delete User', () => {
        it.skip('deletes user after confirmation', async () => {
            const mockFetch = jest.spyOn(global, 'fetch').mockResolvedValueOnce({
                ok: true,
                status: 200,
            });

            renderComponent();

            const deleteButton = screen.getByText('Delete User');
            await userEvent.click(deleteButton);

            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');

            expect(mockFetch).toHaveBeenCalledWith('https://example.com/api/user', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            });

            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);

            mockFetch.mockRestore();
        });

        it('does not delete user if confirmation is canceled', async () => {
            const mockFetch = jest.spyOn(global, 'fetch');

            renderComponent();

            window.confirm = jest.fn().mockReturnValueOnce(false);

            const deleteButton = screen.getByText('Delete User');
            await userEvent.click(deleteButton);

            expect(mockFetch).not.toHaveBeenCalled();
        });
    });

    it.skip('shows snackbar messages', async () => {
        renderComponent();

        // Simulate successful user edit
        mockSetUserProfile.mockImplementationOnce(() => {
            setSnackbarMessage('User edited successfully');
        });

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();

        // Close the snackbar
        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);

        expect(screen.queryByText('User edited successfully')).not.toBeVisible();
    });
});
