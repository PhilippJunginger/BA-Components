import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- setup
- promises
- interface usage
- fireEvemt

- variable - 4
- typeerror - 1
- render Funktion
- props spreading
- unnecessary waitFor

- 5 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -40
CleanCode: -40
Testumfang: 38,85
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
    lastLoginDate: '2023-01-02T00:00:00.000Z',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
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

    it('renders user profile information', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode', () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('saves edited user profile', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });
    });

    it('shows snackbar on successful edit', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        fireEvent.click(screen.getByText('Save'));
        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it.skip('navigates to profile page on button click', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('Show Profile Page'));
        await waitFor(() => {
            expect(mockRouterPush).toHaveBeenCalledWith('http://localhost:3000/user?id=1');
        });
    });

    it.skip('handles image upload', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
        });

        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        await userEvent.upload(fileInput, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-profile.jpg',
            });
        });
    });

    it('handles delete user', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            status: 200,
        });

        window.confirm = jest.fn().mockReturnValue(true);

        renderComponent();
        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('disables delete button if user is registered within a day', () => {
        const recentUserProfile = {
            ...mockUserProfile,
            registrationDate: new Date().toISOString(),
        };
        renderComponent({ userProfile: recentUserProfile });
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
