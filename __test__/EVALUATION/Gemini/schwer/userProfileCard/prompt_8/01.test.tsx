import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- fireEvent

- variable - 3
- typeerror - 2
- render Funktion

- 4 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -30
Testumfang: 27,75
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile-picture.jpg',
    registrationDate: '2023-03-15T10:00:00.000Z',
    lastLoginDate: '2023-03-16T12:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const mockSetUserProfile = jest.fn();

const renderComponent = () => {
    render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
};

describe('UserProfileCardSchwer Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders user profile information correctly', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('expands and collapses additional information', async () => {
        renderComponent();
        const expandButton = screen.getByRole('button', { name: 'show more' });
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 3/15/2023')).toBeVisible();
        expect(screen.getByText('Last Login Date: 3/16/2023')).toBeVisible();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 3/15/2023')).not.toBeVisible();
        expect(screen.queryByText('Last Login Date: 3/16/2023')).not.toBeVisible();
    });

    it('allows editing user profile information', async () => {
        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        const emailInput = screen.getByRole('textbox', { name: 'Email' });

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
    });

    it('handles image upload', async () => {
        // Mocking fetch for image upload
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile-picture.jpg' }),
            }),
        ) as jest.Mock;

        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        const file = new File(['(mocked file contents)'], 'test.jpg', { type: 'image/jpeg' });
        fireEvent.change(fileInput, { target: { files: [file] } });

        expect(fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', {
            method: 'POST',
            body: expect.any(FormData),
        });

        // Add assertions to check if the profile image URL is updated after successful upload
    });

    it('shows snackbar message on successful user edit', async () => {
        renderComponent();
        const editButton = screen.getByRole('button', { name: 'Edit' });
        await userEvent.click(editButton);

        const nameInput = screen.getByRole('textbox', { name: 'Name' });
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByRole('button', { name: 'Save' });
        await userEvent.click(saveButton);

        expect(screen.getByText('User edited successfully')).toBeVisible();
    });

    it('deletes user after confirmation', async () => {
        // Mocking window.confirm for delete confirmation
        window.confirm = jest.fn(() => true);

        // Mocking fetch for user deletion
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        renderComponent();
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        await userEvent.click(deleteButton);

        expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        expect(fetch).toHaveBeenCalledWith('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: '1' }),
        });

        // Add assertions to check if the user profile is set to undefined after successful deletion
    });

    it('disables delete button for recently registered users', () => {
        const recentRegistrationDate = new Date();
        recentRegistrationDate.setDate(recentRegistrationDate.getDate() - 1); // Yesterday

        render(
            <UserProfileCardSchwer
                userProfile={{ ...mockUserProfile, registrationDate: recentRegistrationDate.toISOString() }}
                setUserProfile={mockSetUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const deleteButton = screen.getByRole('button', { name: 'Delete User' });
        expect(deleteButton).toBeDisabled();
    });
});
