import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import UserProfileCardSchwer from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- interface usage
- prefer await findBy

- variable - 2
- render Funktion
- props spreading
- unnecessary waitFor - 3

- 6 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -35
Testumfang: 55,5
 */

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
    email: 'john@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: jest.fn(),
        currentUser: mockCurrentUser,
    };

    return render(<UserProfileCardSchwer {...defaultProps} {...props} />);
};

describe('UserProfileCardSchwer', () => {
    it('renders user profile information', () => {
        renderComponent();

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
        expect(screen.getByRole('img', { name: /user profile image/i })).toHaveAttribute(
            'src',
            'http://example.com/image.jpg',
        );
    });

    it('toggles edit mode when edit button is clicked', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('saves edited user information when save button is clicked', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' })));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('displays snackbar message on image upload failure', async () => {
        renderComponent();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 2 * 1024 * 1024 }); // Set file size to 2MB

        const fileInput = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(fileInput, file);

        expect(await screen.findByText('File size should be less than 1MB')).toBeInTheDocument();
    });

    it.skip('navigates to profile page on button click', async () => {
        renderComponent();

        const showProfilePageButton = screen.getByText('Show Profile Page');
        await userEvent.click(showProfilePageButton);

        await waitFor(() =>
            expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`),
        );
    });

    it.skip('handles user deletion correctly', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        const deleteButton = screen.getByText('Delete User');
        window.confirm = jest.fn().mockImplementation(() => true);
        await userEvent.click(deleteButton);

        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    it.skip('does not delete user if not confirmed', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        const deleteButton = screen.getByText('Delete User');
        window.confirm = jest.fn().mockImplementation(() => false);
        await userEvent.click(deleteButton);

        await waitFor(() => expect(setUserProfile).not.toHaveBeenCalled());
    });

    it('disables delete button if user registered within a day', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
        };

        renderComponent({ userProfile: recentUserProfile });

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
