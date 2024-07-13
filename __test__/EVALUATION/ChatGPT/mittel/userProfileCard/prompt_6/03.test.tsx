import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- usage of interface

- unused import
- variable - 3
- tpyeerror - 2
- unnecessary waitFor - 5
- render funktion
- props spreading


- 4 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -65
Testumfang: 37,5
 */

describe('UserProfileCardMittel Component', () => {
    const userProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        profileImageUrl: 'https://via.placeholder.com/150',
        registrationDate: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
    };

    const currentUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        department: 'Engineering',
    };

    const setup = () => {
        const setUserProfile = jest.fn();
        const props: any = {
            userProfile,
            setUserProfile,
            currentUser,
        };

        render(<UserProfileCardMittel {...props} />);
        return { setUserProfile };
    };

    it('should display user information', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    });

    it.skip('should toggle edit mode', async () => {
        const { setUserProfile } = setup();
        const editButton = screen.getByText('Edit');

        await userEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                name: 'Jane Doe',
                email: 'jane@example.com',
            });
        });
    });

    it.skip('should handle image upload', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ profileImageUrl: 'https://via.placeholder.com/150' }),
            }),
        ) as jest.Mock;

        const { setUserProfile } = setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['hello'], 'hello.png', { type: 'image/png' });
        const input = screen.getByLabelText('Change Profile Picture');
        await userEvent.upload(input, file);

        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith({
                ...userProfile,
                profileImageUrl: 'https://via.placeholder.com/150',
            });
        });

        global.fetch.mockRestore();
    });

    it('should handle snackbar close', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() => {
            expect(screen.getByText('User edited successfully')).toBeInTheDocument();
        });

        await userEvent.click(screen.getByLabelText('close'));
        await waitFor(() => {
            expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
        });
    });

    it.skip('should handle user deletion', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
            }),
        ) as jest.Mock;

        const { setUserProfile } = setup();
        const deleteButton = screen.getByText('Delete User');

        await userEvent.click(deleteButton);
        await waitFor(() => {
            expect(setUserProfile).toHaveBeenCalledWith(undefined);
        });

        global.fetch.mockRestore();
    });

    it('should expand and collapse additional user info', async () => {
        setup();
        const expandButton = screen.getByLabelText('show more');

        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.getByText(/Registration Date/)).toBeInTheDocument();
        });

        await userEvent.click(expandButton);
        await waitFor(() => {
            expect(screen.queryByText(/Registration Date/)).not.toBeInTheDocument();
        });
    });
});
