import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- fireEvent
- condition inside test

- setup
- variable - 3
- missing const
- typeerror - 1
- render Funktion

- 5 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -20
CleanCode: -35
Testumfang: 38,85
 */

const mockUserProfile: UserProfile = {
    id: '123',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-07-01T00:00:00.000Z',
};

const mockCurrentUser = {
    id: '123',
    name: 'Current User',
    email: 'current@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const renderComponent = (editMode = false) => {
    render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
    if (editMode) {
        fireEvent.click(screen.getByText(/edit/i));
    }
};

describe('UserProfileCardSchwer', () => {
    it('renders user profile information', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode', () => {
        renderComponent();

        const editButton = screen.getByText(/edit/i);
        fireEvent.click(editButton);

        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('edits user information', async () => {
        const user = userEvent.setup();
        renderComponent(true);

        const nameInput = screen.getByLabelText(/name/i);
        await user.clear(nameInput);
        await user.type(nameInput, 'Jane Doe');

        const emailInput = screen.getByLabelText(/email/i);
        await user.clear(emailInput);
        await user.type(emailInput, 'jane@example.com');

        fireEvent.click(screen.getByText(/save/i));

        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane@example.com',
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('uploads profile image', async () => {
        const user = userEvent.setup();
        renderComponent(true);

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);
        await user.upload(input, file);

        expect(await screen.findByText('Failed to upload image')).toBeInTheDocument();
    });

    it('navigates to profile page', async () => {
        renderComponent();

        const button = screen.getByText(/show profile page/i);
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=123`);
        });
    });

    it('deletes user', async () => {
        window.confirm = jest.fn().mockImplementation(() => true);
        renderComponent();

        const deleteButton = screen.getByText(/delete user/i);
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
        expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
    });

    it('closes snackbar', async () => {
        renderComponent();
        fireEvent.click(screen.getByText(/edit/i));
        fireEvent.click(screen.getByText(/save/i));

        const closeButton = screen.getByLabelText(/close/i);
        fireEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });

    it('handles invalid image upload size', async () => {
        const user = userEvent.setup();
        renderComponent(true);

        const file = new File(new Array(2 ** 20).fill('(⌐□_□)'), 'largeImage.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);
        await user.upload(input, file);

        expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
    });
});
