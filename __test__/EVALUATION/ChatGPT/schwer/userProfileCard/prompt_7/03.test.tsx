import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/router';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- interface usage
- fireEvent

- variable - 2
- typeerror - 1
- render Funktion
- props spreading
- unnecessary waitFor

- 5 von 9 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -30
Testumfang: 44,4
 */

jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouterPush = jest.fn();
(useRouter as jest.Mock).mockReturnValue({
    push: mockRouterPush,
});

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-01-10T00:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
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
    };

    return render(<UserProfileCardSchwer {...defaultProps} {...props} />);
};

describe('UserProfileCardSchwer', () => {
    it('renders user profile information', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode and updates user profile', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        fireEvent.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });

        fireEvent.click(screen.getByText('Save'));
        await waitFor(() =>
            expect(setUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('handles profile page navigation', async () => {
        renderComponent();
        fireEvent.click(screen.getByLabelText('show more'));
        fireEvent.click(screen.getByText('Show Profile Page'));
        await waitFor(() =>
            expect(mockRouterPush).toHaveBeenCalledWith(`http://localhost:3000/user?id=${mockUserProfile.id}`),
        );
    });

    it.skip('handles image upload', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        fireEvent.click(screen.getByText('Edit'));
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => expect(setUserProfile).toHaveBeenCalled());
    });

    it.skip('handles delete user', async () => {
        global.confirm = jest.fn(() => true);
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });

        fireEvent.click(screen.getByText('Delete User'));
        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    it('disables delete button if user registered less than a day ago', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };
        renderComponent({ userProfile: recentUserProfile });
        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    it.skip('closes snackbar', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.click(screen.getByText('Save'));
        await screen.findByText('User edited successfully');
        fireEvent.click(screen.getByLabelText('close'));
        await waitFor(() => expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument());
    });
});
