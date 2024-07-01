import { UserProfile } from '../../pages';
import { USER_ROLE, UserWithId } from '../../models/user';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import UserProfileCardLeicht from '../../components/leicht/userProfileCardLeicht';
import '@testing-library/jest-dom';

const userProfileMock: UserProfile = {
    id: '123',
    name: 'Test',
    email: 'test@email.com',
    profileImageUrl: 'exampleUrl',
    registrationDate: new Date(),
    lastLoginDate: new Date(),
};
const userMock: UserWithId = {
    id: '123',
    name: 'Test',
    email: 'test@email.com',
    password: 'strongPassword123',
    role: USER_ROLE.EMPLOYEE,
    department: 'IT',
};

describe('Testing UserProfileCardLeicht', () => {
    const setUserProfileMock = jest.fn();
    const user = userEvent.setup();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should toggle additional profile info', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={{ ...userMock, id: '12345' }}
            />,
        );

        expect(screen.queryByText(userProfileMock.registrationDate.toLocaleDateString())).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'show more' }));

        expect(screen.queryByRole('button', { name: 'Delete User' })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
        expect(
            screen.getByText('Registration Date: ' + userProfileMock.registrationDate.toLocaleDateString()),
        ).toBeInTheDocument();
        expect(
            screen.getByText('Last Login Date: ' + userProfileMock.lastLoginDate.toLocaleDateString()),
        ).toBeInTheDocument();
    });

    it('should show dismissible snackbar after making changes', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'T');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'T');

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfileMock,
            name: userProfileMock.name + 'T',
            email: userProfileMock.email + 'T',
        });
        expect(screen.getByRole('alert')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'close' }));
        await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });

    it('should not show snackbar, if no changes were made', async () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));
        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(setUserProfileMock).toHaveBeenCalledTimes(0);
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    it('should disable button for deletion', () => {
        render(
            <UserProfileCardLeicht
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        expect(screen.getByRole('button', { name: 'Delete User' })).toBeDisabled();
    });

    it('should delete user profile', async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        render(
            <UserProfileCardLeicht
                userProfile={{
                    ...userProfileMock,
                    registrationDate: oneWeekAgo,
                }}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Delete User' }));
        expect(setUserProfileMock).toHaveBeenCalledWith(undefined);
    });
});
