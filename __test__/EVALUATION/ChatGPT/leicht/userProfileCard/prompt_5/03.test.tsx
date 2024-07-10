import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import UserProfileCardLeicht, {
    UserProfile,
    UserWithId,
} from '../../../../../../components/leicht/userProfileCardLeicht';

/*
- promises
- fireEvent
- setup
- interface usage


- render Funktion
- variable - 1
- unused import
- props spreading
- not using shortened from for function in props

- 4 von 5 notwendigem Testumfang erreicht + 2 Redundanz

Best-Practices: -40
CleanCode: -25
Testumfang: 60
 */

// Sample data for testing
const userProfile: UserProfile = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    profileImageUrl: 'https://via.placeholder.com/140',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};

const currentUser: UserWithId = {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'password',
};

const setUserProfileMock = jest.fn();

const setup = (props: any = {}) => {
    const defaultProps = {
        userProfile,
        setUserProfile: setUserProfileMock,
        currentUser,
    };
    return render(<UserProfileCardLeicht {...defaultProps} {...props} />);
};

describe('UserProfileCardLeicht', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('renders user profile card with initial data', () => {
        setup();
        expect(screen.getByText(userProfile.name)).toBeInTheDocument();
        expect(screen.getByText(`Email: ${userProfile.email}`)).toBeInTheDocument();
        expect(screen.getByAltText('User profile image')).toBeInTheDocument();
    });

    test.skip('toggles edit mode and edits user information', async () => {
        setup();
        await userEvent.click(screen.getByText('Edit'));
        expect(screen.getByLabelText('Name')).toBeInTheDocument();
        expect(screen.getByLabelText('Email')).toBeInTheDocument();

        await userEvent.type(screen.getByLabelText('Name'), 'Jane Doe');
        await userEvent.type(screen.getByLabelText('Email'), 'jane.doe@example.com');
        await userEvent.click(screen.getByText('Save'));

        expect(setUserProfileMock).toHaveBeenCalledWith(
            expect.objectContaining({
                name: 'Jane Doe',
                email: 'jane.doe@example.com',
            }),
        );
        expect(screen.getByText('User edited successfully')).toBeInTheDocument();
    });

    test('expands and collapses user details', async () => {
        setup();
        const expandButton = screen.getByLabelText('show more');
        await userEvent.click(expandButton);

        expect(screen.getByText(/Registration Date:/)).toBeInTheDocument();
        expect(screen.getByText(/Last Login Date:/)).toBeInTheDocument();

        await userEvent.click(expandButton);
        expect(screen.queryByText(/Registration Date:/)).not.toBeInTheDocument();
        expect(screen.queryByText(/Last Login Date:/)).not.toBeInTheDocument();
    });

    test.skip('deletes user profile if allowed', async () => {
        setup();
        await userEvent.click(screen.getByText('Delete User'));
        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });

    test('disables delete button if registration is less than a day old', () => {
        const recentUserProfile = { ...userProfile, registrationDate: new Date() };
        setup({ userProfile: recentUserProfile });
        expect(screen.getByText('Delete User')).toBeDisabled();
    });

    test.skip('closes snackbar message', async () => {
        setup();
        await userEvent.click(screen.getByText('Edit'));
        await userEvent.click(screen.getByText('Save'));
        const closeButton = screen.getByLabelText('close');
        await userEvent.click(closeButton);
        expect(screen.queryByText('User edited successfully')).not.toBeInTheDocument();
    });
});
