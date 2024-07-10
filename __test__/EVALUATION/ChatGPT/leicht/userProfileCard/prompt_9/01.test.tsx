import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- fireEvent
- promises
- setup

- unused import
- variable - 1

- 3 von 5 notwendigem Testumfang erreicht + 3 Redundanz

Best-Practices: -30
CleanCode: -10
Testumfang: 30
 */

describe('UserProfileCardLeicht', () => {
    const mockUserProfile: UserProfile = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        profileImageUrl: 'https://example.com/profile.jpg',
        registrationDate: new Date(),
        lastLoginDate: new Date(),
    };

    const mockCurrentUser: UserWithId = {
        id: '1',
        name: 'John Doe',
        email: 'john.doe@example.com',
        password: 'password123',
    };

    const setUserProfile = jest.fn();

    beforeEach(() => {
        setUserProfile.mockClear();
    });

    it('renders user profile information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        expect(screen.getByText(mockUserProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${mockUserProfile.email}`)).toBeInTheDocument();
    });

    it('toggles edit mode when the edit button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('saves edited user information and shows snackbar message', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');
        await userEvent.clear(nameInput);
        await userEvent.type(nameInput, 'Jane Doe');
        await userEvent.clear(emailInput);
        await userEvent.type(emailInput, 'jane.doe@example.com');

        fireEvent.click(screen.getByText('Save'));
        expect(setUserProfile).toHaveBeenCalledWith({
            ...mockUserProfile,
            name: 'Jane Doe',
            email: 'jane.doe@example.com',
        });
        expect(await screen.findByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('expands and collapses additional information', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const expandButton = screen.getByLabelText('show more');
        fireEvent.click(expandButton);
        expect(
            screen.getByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
        ).toBeInTheDocument();
        expect(
            screen.getByText(`Last Login Date: ${mockUserProfile.lastLoginDate.toLocaleDateString()}`),
        ).toBeInTheDocument();
        fireEvent.click(expandButton);
        expect(
            screen.queryByText(`Registration Date: ${mockUserProfile.registrationDate.toLocaleDateString()}`),
        ).not.toBeInTheDocument();
    });

    it.skip('deletes user profile when delete button is clicked', () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const deleteButton = screen.getByText('Delete User');
        fireEvent.click(deleteButton);
        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it.skip('disables delete button if user registered more than a day ago', () => {
        const oldUserProfile = { ...mockUserProfile, registrationDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) };
        render(
            <UserProfileCardLeicht
                userProfile={oldUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });

    it.skip('closes the snackbar message', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={mockUserProfile}
                setUserProfile={setUserProfile}
                currentUser={mockCurrentUser}
            />,
        );
        const editButton = screen.getByText('Edit');
        fireEvent.click(editButton);
        fireEvent.click(screen.getByText('Save'));
        const closeButton = await screen.findByLabelText('close');
        fireEvent.click(closeButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
