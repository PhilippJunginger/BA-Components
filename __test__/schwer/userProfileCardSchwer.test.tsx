import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from '../../pages';
import { USER_ROLE, UserWithId } from '../../models/user';
import UserProfileCardSchwer from '../../components/schwierig/userProfileCardSchwer';
import { useRouter } from 'next/router';

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

jest.mock('next/router', () => ({
    ...jest.requireActual('next/router'),
    useRouter: jest.fn(),
}));

describe('Testing UserProfileCardSchwer', () => {
    const setUserProfileMock = jest.fn();
    const user = userEvent.setup();
    const mockRouter = {
        pathname: '/',
        push: jest.fn(),
        query: {
            shouldRoute: false,
        },
    };

    beforeEach(() => {
        jest.resetAllMocks();
        (useRouter as jest.Mock).mockReturnValue(mockRouter);
    });

    it('should route to UserProfilePage', async () => {
        render(
            <UserProfileCardSchwer
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

        await user.click(screen.getByRole('button', { name: 'Show Profile Page' }));
        expect(mockRouter.push).toHaveBeenCalledWith(`http://localhost:3000/user?id=${userProfileMock.id}`);
    });

    it('should show snackbar after editing user', async () => {
        const profileImageUrl = 'localhost:3000/image';
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({ profileImageUrl }),
                }),
            ) as jest.Mock,
        );
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 });

        render(
            <UserProfileCardSchwer
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));

        await user.type(screen.getByRole('textbox', { name: 'Name' }), 'T');
        await user.type(screen.getByRole('textbox', { name: 'Email' }), 'T');
        await user.upload(screen.getByRole('button', { name: 'Change Profile Picture' }), file);

        await user.click(screen.getByRole('button', { name: 'Save' }));

        expect(setUserProfileMock).toHaveBeenCalledWith({
            ...userProfileMock,
            name: userProfileMock.name + 'T',
            email: userProfileMock.email + 'T',
            profileImageUrl,
        });
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should show snackbar, if image size is too big', async () => {
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1048577 });

        render(
            <UserProfileCardSchwer
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));
        await user.upload(screen.getByRole('button', { name: 'Change Profile Picture' }), file);

        expect(screen.getByText('File size should be less than 1MB')).toBeInTheDocument();
    });

    it('should show snackbar, if uploading fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 300,
                    json: () => Promise.resolve({}),
                }),
            ) as jest.Mock,
        );
        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 });

        render(
            <UserProfileCardSchwer
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));
        await user.upload(screen.getByRole('button', { name: 'Change Profile Picture' }), file);

        expect(setUserProfileMock).toHaveBeenCalledTimes(0);
        expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('should not show snackbar, if no changes were made', async () => {
        render(
            <UserProfileCardSchwer
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
            <UserProfileCardSchwer
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

        jest.spyOn(window, 'confirm').mockReturnValue(true);
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({}),
                }),
            ) as jest.Mock,
        );

        render(
            <UserProfileCardSchwer
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

    it('should close snackbar after deletion fails', async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        jest.spyOn(window, 'confirm').mockReturnValue(true);
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: false,
                    status: 400,
                    json: () => Promise.resolve({}),
                }),
            ) as jest.Mock,
        );

        render(
            <UserProfileCardSchwer
                userProfile={{
                    ...userProfileMock,
                    registrationDate: oneWeekAgo,
                }}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Delete User' }));
        expect(setUserProfileMock).toHaveBeenCalledTimes(0);
        expect(screen.getByRole('alert')).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'close' }));
        await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    });

    it('should not delete, if not confirmed', async () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        jest.spyOn(window, 'confirm').mockReturnValue(false);
        const fetch = jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    status: 200,
                    json: () => Promise.resolve({}),
                }),
            ) as jest.Mock,
        );

        render(
            <UserProfileCardSchwer
                userProfile={{
                    ...userProfileMock,
                    registrationDate: oneWeekAgo,
                }}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Delete User' }));
        expect(fetch).toHaveBeenCalledTimes(0);
    });
});
