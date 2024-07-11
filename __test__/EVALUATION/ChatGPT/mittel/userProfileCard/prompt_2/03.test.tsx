import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- fireEvent
- node access
- interface usage
- if inside test
- setup

- variable - 3
- typeerror - 1
- unnecessary waitFor
- props spreading
- render Funktion
- unnecessary mock


- 7 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -50
CleanCode: -40
Testumfang: 75
 */

jest.mock('@mui/material', () => ({
    ...jest.requireActual('@mui/material'),
    Snackbar: ({ open, message, action }: any) =>
        open ? (
            <div>
                {message}
                {action}
            </div>
        ) : null,
}));

const mockFetch = jest.fn();

global.fetch = mockFetch;

const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/profile.jpg',
    registrationDate: '2023-07-10T00:00:00Z',
    lastLoginDate: '2023-07-11T00:00:00Z',
};

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const setup = (propsOverride: any = {}) => {
    const setUserProfile = jest.fn();
    const props = {
        userProfile,
        setUserProfile,
        currentUser,
        ...propsOverride,
    };
    render(<UserProfileCardMittel {...props} />);
    return {
        setUserProfile,
    };
};

describe('UserProfileCardMittel', () => {
    beforeEach(() => {
        mockFetch.mockReset();
    });

    it('should render the component with user details', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toHaveAttribute('src', 'http://example.com/profile.jpg');
    });

    it.skip('should toggle expand collapse on button click', () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 7/10/2023')).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 7/10/2023')).not.toBeInTheDocument();
    });

    it('should enter edit mode on Edit button click', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it.skip('should update user profile on Save button click', async () => {
        const { setUserProfile } = setup();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.type(emailInput, 'jane.doe@example.com');

        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            });
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should show error message on file size exceeding limit during image upload', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1048577 });

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
        if (fileInput) {
            fireEvent.change(fileInput, { target: { files: [file] } });
        }

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    it.skip('should show success message on successful image upload', async () => {
        setup();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: async () => ({ profileImageUrl: 'http://example.com/new-profile.jpg' }),
        });

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
        if (fileInput) {
            fireEvent.change(fileInput, { target: { files: [file] } });
        }

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    it.skip('should show error message on failed image upload', async () => {
        setup();

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
        });

        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const file = new File(['(⌐□_□)'], 'profile.png', { type: 'image/png' });

        const fileInput = screen.getByLabelText('Change Profile Picture').querySelector('input');
        if (fileInput) {
            fireEvent.change(fileInput, { target: { files: [file] } });
        }

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    it('should delete user on Delete button click', async () => {
        const { setUserProfile } = setup();

        mockFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
        });

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('should show error message on failed user deletion', async () => {
        setup();

        mockFetch.mockResolvedValueOnce({
            ok: false,
            status: 400,
        });

        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
