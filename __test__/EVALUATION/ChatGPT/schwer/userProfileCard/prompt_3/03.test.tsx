import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- interface usage

- variable - 4
- typeerror - 2
- unnecessary waitFor - 7
- render funktion
- props spreading

- 7 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -75
Testumfang: 66,6
 */

// Mock useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00Z',
    lastLoginDate: '2023-01-10T00:00:00Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const renderComponent = (props: any = {}) => {
    return render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={mockSetUserProfile}
            currentUser={mockCurrentUser}
            {...props}
        />,
    );
};

describe('UserProfileCardSchwer', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component with user profile details', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it('toggles edit mode and updates user profile', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('handles image upload', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ profileImageUrl: 'http://example.com/new-profile.jpg' }),
        });

        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'http://example.com/new-profile.jpg',
            });
        });
    });

    it('handles profile page navigation', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        const profilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(profilePageButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
        });
    });

    it('handles user deletion', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
        });

        window.confirm = jest.fn().mockReturnValue(true);

        renderComponent();
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('displays snackbar message and closes it', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });

    it('disables delete button if user registered within a day', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };

        renderComponent({ userProfile: recentUserProfile });
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it('handles image upload error', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
        });

        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('handles user deletion error', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
        });

        window.confirm = jest.fn().mockReturnValue(true);

        renderComponent();
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
