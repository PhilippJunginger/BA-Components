import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- waitFor assertions
- interface usage

- variable - 2
- typeerror - 1
- unnecessary waitFor
- props spreading
- render Funktion
- setup

- 6 von 8 notwendigem Testumfang erreicht + 4 Redundanz

Best-Practices: -30
CleanCode: -35
Testumfang: 50
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: jest.fn(),
        currentUser: mockCurrentUser,
        ...props,
    };

    return render(<UserProfileCardMittel {...defaultProps} />);
};

describe('UserProfileCardMittel', () => {
    it('should render the component', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it.skip('should toggle expand/collapse section', () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date:')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date:')).toBeInTheDocument();
    });

    it('should enter edit mode when edit button is clicked', () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should update the user profile on save', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        fireEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });
        fireEvent.change(emailInput, { target: { value: 'jane.doe@example.com' } });

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });
    });

    it('should display snackbar message on save', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Edit'));

        const nameInput = screen.getByLabelText('Name');
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it.skip('should handle image upload successfully', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-image.jpg' }),
        });

        renderComponent();
        fireEvent.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('https://example.com/api/upload-image', expect.any(Object));
            expect(screen.getByAltText('User profile image')).toHaveAttribute(
                'src',
                'https://example.com/new-image.jpg',
            );
        });
    });

    it('should handle image upload error', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Failed to upload image'));

        renderComponent();
        fireEvent.click(screen.getByText('Edit'));

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });

        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it.skip('should delete user when delete button is clicked', async () => {
        const setUserProfile = jest.fn();
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
        });

        renderComponent({ setUserProfile });

        fireEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('should disable delete button if user is less than a day old', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };
        renderComponent({ userProfile: recentUserProfile });

        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it('should close snackbar when close button is clicked', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Edit'));
        const nameInput = screen.getByLabelText('Name');
        fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        fireEvent.click(screen.getByLabelText('close'));

        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });
});
