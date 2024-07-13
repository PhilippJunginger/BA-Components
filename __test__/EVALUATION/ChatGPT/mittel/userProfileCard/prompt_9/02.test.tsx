import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardMittel from '../../../../../../components/mittel/userProfileCardMittel';

/*
- setup
- interface usage
- promsises

- variable - 2
- typeerror
- unnecessary waitFor - 2
- render Funkton
- unused import
- props spreading


- 5 von 8 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -30
CleanCode: -35
Testumfang: 50
 */

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://example.com/profile.jpg',
    registrationDate: '2023-01-01T00:00:00.000Z',
    lastLoginDate: '2023-06-01T00:00:00.000Z',
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
    test('renders user profile details', () => {
        renderComponent();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
    });

    test('toggle edit mode and save changes', async () => {
        const setUserProfile = jest.fn();
        renderComponent({ setUserProfile });
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));

        await waitFor(() =>
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Jane Doe',
                    email: 'jane.doe@example.com',
                }),
            ),
        );
    });

    test('expand and collapse details', async () => {
        renderComponent();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText('Registration Date: 1/1/2023')).toBeInTheDocument();
        expect(screen.getByText('Last Login Date: 6/1/2023')).toBeInTheDocument();
    });

    test('show snackbar on save', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });

    test.skip('handle image upload', async () => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ profileImageUrl: 'https://example.com/new-profile.jpg' }),
            }),
        ) as jest.Mock;

        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const file = new File(['dummy content'], 'example.png', { type: 'image/png' });
        const fileInput = screen.getByLabelText('Change Profile Picture');

        await userEvent.upload(fileInput, file);

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        await screen.findByText('User edited successfully');
    });

    test('handle delete user', async () => {
        const setUserProfile = jest.fn();
        global.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
            }),
        ) as jest.Mock;

        renderComponent({ setUserProfile });
        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    test('handle close snackbar', async () => {
        renderComponent();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');

        await userEvent.click(screen.getByText('Save'));

        await userEvent.click(screen.getByLabelText('close'));
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
