import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- promsises
- usage of interface

- variable - 3
- typeerror - 3
- unnecessary waitFor -
- render Funktion
- porps spreading
- unused import


- 7 von 8 notwendigem Testumfang erreicht + 1 Redundanz

Best-Practices: -30
CleanCode: -50
Testumfang: 81,25
 */

const mockUserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-01-10T00:00:00.000Z',
};

const mockCurrentUser = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
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

describe('UserProfileCardMittel', () => {
    it('renders user profile information', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    it('toggles edit mode', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('saves edited user profile', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        const saveButton = screen.getByText('Save');
        await userEvent.click(saveButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                name: 'Jane Doe',
            });
        });
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it('displays error message for large image upload', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1048577 });

        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
        });
    });

    it.skip('handles image upload', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
            }),
        ) as jest.Mock;

        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith({
                ...mockUserProfile,
                profileImageUrl: 'https://example.com/new-profile.jpg',
            });
        });
    });

    it('expands and collapses additional information', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);
        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 1/10/2023')).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText('Registration Date: 1/1/2023')).not.toBeInTheDocument();
    });

    it('deletes user profile', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            }),
        ) as jest.Mock;

        renderComponent();
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(mockSetUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    it('displays error message when deleting user fails', async () => {
        global.fetch = jest.fn(() => Promise.reject(new Error('Failed to delete user'))) as jest.Mock;

        renderComponent();
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });
});
