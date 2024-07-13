import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { useRouter } from 'next/router';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- interface usage
- fireEvent
- node access

- variable - 1
- typeerror - 2
- unnecessary waitFor - 3
- render funktion
- props spreading

- 4 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -40
Testumfang: 33,3
 */

// Mock the useRouter hook
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({ push: mockPush });

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const renderComponent = (props: any = {}) => {
    const defaultProps = {
        userProfile: mockUserProfile,
        setUserProfile: jest.fn(),
        currentUser: mockCurrentUser,
        ...props,
    };

    return render(<UserProfileCardSchwer {...defaultProps} />);
};

describe('UserProfileCardSchwer Component', () => {
    const user = userEvent.setup();

    it('should render user profile information', () => {
        renderComponent();
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', mockUserProfile.profileImageUrl);
    });

    it.skip('should toggle edit mode and save changes', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        fireEvent.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await user.type(screen.getByLabelText('Name'), 'Updated Name');
        await user.type(screen.getByLabelText('Email'), 'updated.email@example.com');

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Updated Name',
                    email: 'updated.email@example.com',
                }),
            );
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should show error message for large image upload', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Edit'));
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png', size: 2 * 1048576 });
        const input = screen.getByLabelText('Change Profile Picture').querySelector('input');

        Object.defineProperty(input, 'files', {
            value: [file],
        });

        fireEvent.change(input);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    it('should handle profile page navigation', async () => {
        renderComponent();

        fireEvent.click(screen.getByLabelText('show more'));
        await user.click(screen.getByText('Show Profile Page'));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`);
        });
    });

    it.skip('should handle user deletion confirmation', async () => {
        const setUserProfile = jest.fn();
        global.confirm = jest.fn(() => true);

        renderComponent({ setUserProfile });

        await user.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(global.confirm).toHaveBeenCalledWith('Are you sure you want to delete the user?');
        });
    });

    it('should display snackbar and close it', async () => {
        renderComponent();

        fireEvent.click(screen.getByText('Edit'));
        await user.type(screen.getByLabelText('Name'), 'Updated Name');
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
