import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- fireEvent
- promises
- setupe
- interface usag

- variable - 1
- typeerror - 1
- unused import
- render Funktion
- unnecessary waitFor - 6

- 5 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -50
Testumfang: 44,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
});

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: '/path/to/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const renderComponent = (props: any = {}) => {
    return render(
        <UserProfileCardSchwer
            userProfile={props.userProfile || mockUserProfile}
            setUserProfile={props.setUserProfile || jest.fn()}
            currentUser={props.currentUser || mockCurrentUser}
        />,
    );
};

describe('UserProfileCardSchwer Component', () => {
    it('renders user profile information', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        const mockSetUserProfile = jest.fn();
        renderComponent({ setUserProfile: mockSetUserProfile });

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

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

    it.skip('shows profile page when button clicked', async () => {
        renderComponent();
        const profileButton = screen.getByText('Show Profile Page');
        await userEvent.click(profileButton);

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
        });
    });

    it.skip('handles image upload', async () => {
        const file = new File(['image'], 'image.png', { type: 'image/png' });
        const mockSetUserProfile = jest.fn();
        renderComponent({ setUserProfile: mockSetUserProfile });

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: '/new/path/to/image.png',
            });
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('displays error message when image upload fails', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to upload image'))) as jest.Mock;

        const file = new File(['image'], 'image.png', { type: 'image/png' });
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('handles delete user', async () => {
        const mockSetUserProfile = jest.fn();
        window.confirm = jest.fn(() => true);

        renderComponent({ setUserProfile: mockSetUserProfile });

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('closes snackbar', async () => {
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

        const closeSnackbarButton = screen.getByLabelText('close');
        await userEvent.click(closeSnackbarButton);

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
