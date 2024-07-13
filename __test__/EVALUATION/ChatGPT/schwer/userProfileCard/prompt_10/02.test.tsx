import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/router';
import { UserProfile } from '../../../../../../components/leicht/userProfileCardLeicht';
import UserProfileCardSchwer, { UserWithId } from '../../../../../../components/schwierig/userProfileCardSchwer';

/*
- prefer findBy
- promises
- setup

- variable - 4
- type error - 2
- render Funktion
- unnecessary waitFor - 4
- unused import

- 5 von 9 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -60
Testumfang: 38,85
 */

// Mocking useRouter
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

const mockRouter = {
    push: jest.fn(),
};

(useRouter as jest.Mock).mockReturnValue(mockRouter);

const mockUserProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'http://example.com/image.jpg',
    registrationDate: '2023-01-01',
    lastLoginDate: '2023-07-01',
};

const mockCurrentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password123',
};

const setup = () => {
    const setUserProfile = jest.fn();
    render(
        <UserProfileCardSchwer
            userProfile={mockUserProfile}
            setUserProfile={setUserProfile}
            currentUser={mockCurrentUser}
        />,
    );
    return { setUserProfile };
};

describe('UserProfileCardSchwer', () => {
    it('renders user profile details', () => {
        setup();
        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('Email: john.doe@example.com')).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    it('expands and collapses additional details', async () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument();

        await userEvent.click(expandButton);
        await screen.findByText('Registration Date: 1/1/2023');

        await userEvent.click(expandButton);
        await waitFor(() => expect(screen.queryByText('Registration Date:')).not.toBeInTheDocument());
    });

    it('enters edit mode and updates profile details', async () => {
        const { setUserProfile } = setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john.doe@example.com');

        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        await userEvent.click(screen.getByText('Save'));
        await waitFor(() =>
            expect(setUserProfile).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'Jane Doe', email: 'jane.doe@example.com' }),
            ),
        );
    });

    it('displays snackbar message on save', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.click(screen.getByText('Save'));

        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('navigates to profile page', async () => {
        setup();
        await userEvent.click(screen.getByText('Show Profile Page'));
        await waitFor(() => expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=1`));
    });

    it.skip('handles image upload error if file is too large', async () => {
        setup();
        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const fileInput = screen.getByLabelText('Change Profile Picture');
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png', size: 1048577 });
        await userEvent.upload(fileInput, file);

        expect(await screen.findByText('File size should be less than 1MB')).toBeInTheDocument();
    });

    it.skip('deletes user after confirmation', async () => {
        const { setUserProfile } = setup();
        window.confirm = jest.fn().mockImplementation(() => true);
        await userEvent.click(screen.getByText('Delete User'));

        await waitFor(() => expect(setUserProfile).toHaveBeenCalledWith(undefined));
    });

    it('displays error snackbar on delete failure', async () => {
        setup();
        window.confirm = jest.fn().mockImplementation(() => true);

        global.fetch = jest.fn().mockImplementation(() => Promise.reject());
        await userEvent.click(screen.getByText('Delete User'));

        expect(await screen.findByText('Failed to delete user')).toBeInTheDocument();
    });
});
