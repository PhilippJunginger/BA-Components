import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel, { UserWithId } from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- promises
- fireEvent
- interface usage

- variable - 4
- typeerror -
- unnecessary waitFor - 2
- render Funktion
- props spreading


- 7 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -45
Testumfang: 75
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/image.jpg',
    registrationDate: new Date().toISOString(),
    lastLoginDate: new Date().toISOString(),
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

    return render(<UserProfileCardMittel {...defaultProps} {...props} />);
};

describe('UserProfileCardMittel', () => {
    test('renders user profile information', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    test('toggles edit mode when Edit button is clicked', () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
        fireEvent.click(screen.getByText('Save'));
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    test('updates user profile information on Save', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                }),
            );
        });
    });

    test('displays snackbar on Save', async () => {
        renderComponent();
        fireEvent.click(screen.getByText('Edit'));
        fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Jane Doe' } });
        fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'jane.doe@example.com' } });
        fireEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });
    });

    test.skip('handles image upload', async () => {
        const setUserProfile = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-image.jpg' }),
            }),
        ) as jest.Mock;

        renderComponent({ setUserProfile });
        fireEvent.click(screen.getByText('Edit'));

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    profileImageUrl: 'https://example.com/new-image.jpg',
                }),
            );
        });
    });

    test('handles image upload error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 400,
            }),
        ) as jest.Mock;

        renderComponent();
        fireEvent.click(screen.getByText('Edit'));

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        const input = screen.getByLabelText(/change profile picture/i);
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
        });
    });

    test.skip('deletes user when Delete button is clicked', async () => {
        const setUserProfile = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        renderComponent({ setUserProfile });
        fireEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });
    });

    test.skip('displays snackbar on delete user error', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 400,
            }),
        ) as jest.Mock;

        renderComponent();
        fireEvent.click(screen.getByText('Delete User'));

        await waitFor(() => {
            expect(screen.getByText('Failed to delete user')).toBeInTheDocument();
        });
    });

    test.skip('expands and collapses additional information', () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();
    });
});
