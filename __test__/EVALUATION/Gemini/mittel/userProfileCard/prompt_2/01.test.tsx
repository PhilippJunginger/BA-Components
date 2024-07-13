import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- usage of interface
- fireEVemt

- variable
- typeerror
- render Funktion
- props spreading
- setup


- 3 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -20
CleanCode: -25
Testumfang: 31,25
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'password123',
};

const mockSetUserProfile = jest.fn();

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: mockSetUserProfile,
        currentUser: mockCurrentUser,
    };

    return render(<UserProfileCardMittel {...defaultProps} {...props} />);
};

describe('UserProfileCardMittel Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn() as jest.Mock;
    });

    it('renders user profile information correctly', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img', { name: 'User profile image' })).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        const user = userEvent.setup();
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await user.click(expandButton);
        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await user.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        const user = userEvent.setup();
        renderComponent();
        const editButton = screen.getByText('Edit');
        await user.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        expect(screen.getByText('Change Profile Picture')).toBeInTheDocument();

        const newName = 'Jane Doe';
        const newEmail = 'janedoe@example.com';
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: newName } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: newEmail } });

        await user.click(screen.getByText('Save'));
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: newName,
            email: newEmail,
        });
    });

    it.skip('handles image upload', async () => {
        const user = userEvent.setup();
        const file = new File(['(mocked file)'], 'image.jpg', { type: 'image/jpeg' });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
        });

        renderComponent();
        await user.click(screen.getByText('Edit'));
        const input = screen.getByLabelText('Change Profile Picture') as HTMLInputElement;
        fireEvent.change(input, { target: { files: [file] } });

        expect(global.fetch).toHaveBeenCalledTimes(1);
        expect(mockSetUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            profileImageUrl: 'https://example.com/new-profile.jpg',
        });
    });

    // Add more tests for error handling, API failures, delete functionality, etc.
});
