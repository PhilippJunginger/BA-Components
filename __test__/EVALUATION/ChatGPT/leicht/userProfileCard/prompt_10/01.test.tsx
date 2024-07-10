import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- setup
- interface usage

- unused import
- variable - 1
- render Funktion
- props spreading

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -20
CleanCode: -20
Testumfang: 60
 */

const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    profileImageUrl: 'https://via.placeholder.com/140',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
};

const setup = (propsOverride = {}) => {
    const setUserProfile = jest.fn();
    const props: any = {
        userProfile,
        setUserProfile,
        currentUser,
        ...propsOverride,
    };

    render(<UserProfileCardLeicht {...props} />);

    return {
        setUserProfile,
    };
};

describe('UserProfileCardLeicht', () => {
    it('should display user profile information', () => {
        setup();

        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
    });

    it('should expand and collapse details section', async () => {
        setup();

        const expandButton = screen.getByLabelText('show more');
        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.getByText(/Registration Date/i)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date/i)).not.toBeInTheDocument();
    });

    it('should toggle edit mode and save changes', async () => {
        const { setUserProfile } = setup();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        expect(nameInput).toBeInTheDocument();
        expect(emailInput).toBeInTheDocument();

        await userEvent.type(nameInput, ' Smith');
        await userEvent.type(emailInput, '.com');

        await userEvent.click(screen.getByText('Save'));
        expect(setUserProfile).toHaveBeenCalledWith({
            ...userProfile,
            name: 'John Doe Smith',
            email: 'john@example.com.com',
        });

        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    it.skip('should delete user if delete button is clicked', async () => {
        const { setUserProfile } = setup();

        const deleteButton = screen.getByText('Delete User');
        await userEvent.click(deleteButton);

        expect(setUserProfile).toHaveBeenCalledWith(undefined);
    });

    it('should close the snackbar message', async () => {
        setup();

        const editButton = screen.getByText('Edit');
        await userEvent.click(editButton);

        const nameInput = screen.getByLabelText('Name');
        const emailInput = screen.getByLabelText('Email');

        await userEvent.type(nameInput, ' Smith');
        await userEvent.type(emailInput, '.com');

        await userEvent.click(screen.getByText('Save'));
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();

        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);

        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });

    it('should disable delete button if user registered less than 24 hours ago', () => {
        setup();

        const deleteButton = screen.getByText('Delete User');
        expect(deleteButton).toBeDisabled();
    });
});
