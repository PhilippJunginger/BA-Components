import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent

- variable - 3
- typeerror - 1
- unnecessary module
- render Funktion

- 7 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 55,5
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const renderComponent = () => {
    render(
        <BrowserRouter>
            <UserProfileCardSchwer
                userProfile={mockUserProfile}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />
        </BrowserRouter>,
    );
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render user profile information', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('should expand and collapse the card', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 3/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 3/16/2023')).toBeVisible();

        await userEvent.click(expandButton);
        // Expect the content to be hidden (not present in the DOM)
        expect(screen.queryByText('Registration Date: 3/15/2023')).not.toBeInTheDocument();
        expect(screen.queryByText('Last Login Date: 3/16/2023')).not.toBeInTheDocument();
    });

    it('should show profile page on button click', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        const profilePageButton = screen.getByText('Show Profile Page');
        expect(profilePageButton).toBeInTheDocument();
        // We're not testing the navigation itself here, as it's mocked by BrowserRouter
    });

    describe('Edit Mode', () => {
        it('should toggle edit mode', async () => {
            renderComponent();
            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);
            expect(screen.getByLabelText('Name')).toBeInTheDocument();
            expect(screen.getByLabelText('Email')).toBeInTheDocument();
            expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();
        });

        it('should update user profile on save', async () => {
            renderComponent();
            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
            await userEvent.type(nameInput, ' Jane');
            await userEvent.type(emailInput, 'jane.doe@example.com');

            const saveButton = screen.getByText('Save');
            await userEvent.click(saveButton);

            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'John Doe Jane',
                email: 'jane.doe@example.com',
            });
        });

        it('should show snackbar message after editing user', async () => {
            renderComponent();
            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);

            const nameInput = screen.getByLabelText('Name') as HTMLInputElement;
            await userEvent.type(nameInput, ' Jane');

            const saveButton = screen.getByText('Save');
            await userEvent.click(saveButton);

            expect(screen.getByText('User edited successfully')).toBeVisible();
        });

        it('should handle image upload', async () => {
            renderComponent();
            const editButton = screen.getByText('Edit');
            await userEvent.click(editButton);

            const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
            const mockFile = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
            Object.defineProperty(fileInput, 'files', {
                value: [mockFile],
            });

            // We'll mock the fetch call in this test
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
                }),
            ) as jest.Mock;

            fireEvent.change(fileInput);

            // Check if fetch was called with the correct arguments
            expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
                method: 'POST',
                body: expect.any(FormData), // Check if it's a FormData object
            });

            // After the fetch resolves
            await screen.findByText('User edited successfully'); // Assuming snackbar shows success
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-image.jpg',
            });
        });
    });

    describe('Delete User', () => {
        it('should delete user on confirmation', async () => {
            renderComponent();
            const deleteButton = screen.getByText('Delete User');

            // Mock window.confirm to return true (user confirms)
            window.confirm = jest.fn(() => true);

            // Mock fetch for successful deletion
            global.fetch = jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                }),
            ) as jest.Mock;

            await userEvent.click(deleteButton);

            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
            expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
                method: 'POST',
                body: JSON.stringify({ userId: '1' }),
            });
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        it('should not delete user if not confirmed', async () => {
            renderComponent();
            const deleteButton = screen.getByText('Delete User');

            // Mock window.confirm to return false (user cancels)
            window.confirm = jest.fn(() => false);

            await userEvent.click(deleteButton);

            expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
            // Ensure fetch is not called
            expect(fetch).not.toHaveBeenCalled();
            expect(mockSetUserProfile).not.toHaveBeenCalled();
        });

        it('should show snackbar message if deletion fails', async () => {
            renderComponent();
            const deleteButton = screen.getByText('Delete User');

            window.confirm = jest.fn(() => true);

            // Mock fetch to simulate an error during deletion
            global.fetch = jest.fn(() => Promise.reject(new Error('Failed to delete'))) as jest.Mock;

            await userEvent.click(deleteButton);

            expect(screen.getByText('Failed to delete user')).toBeVisible();
        });
    });
});
