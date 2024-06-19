import { render, screen } from '@testing-library/react';
import UserProfileCardMittel from '../components/mittel/userProfileCardMittel';
import { UserProfile } from '../pages';
import { USER_ROLE, UserWithId } from '../models/user';
import userEvent from '@testing-library/user-event';

describe('Testing UserProfileCard', () => {
    const setUserProfileMock = jest.fn();
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
    const user = userEvent.setup();

    it('should be able to edit the user', async () => {
        render(
            <UserProfileCardMittel
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
    });

    it('should toggle additional profile info', async () => {
        render(
            <UserProfileCardMittel
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        expect(screen.queryByText(userProfileMock.registrationDate.toLocaleDateString())).not.toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: 'show more' }));

        expect(
            screen.getByText('Registration Date: ' + userProfileMock.registrationDate.toLocaleDateString()),
        ).toBeInTheDocument();
    });

    it('should show an error when image upload fails', async () => {
        jest.spyOn(global, 'fetch').mockImplementation(
            jest.fn(() =>
                Promise.resolve({
                    ok: true,
                    json: () => Promise.reject(),
                    status: 400,
                }),
            ) as jest.Mock,
        );

        const file = new File(['(⌐□_□)'], 'chucknorris.png', { type: 'image/png' });
        Object.defineProperty(file, 'size', { value: 1024 });

        render(
            <UserProfileCardMittel
                userProfile={userProfileMock}
                setUserProfile={setUserProfileMock}
                currentUser={userMock}
            />,
        );

        await user.click(screen.getByRole('button', { name: 'Edit' }));
        await user.upload(screen.getByRole('button', { name: 'Change Profile Picture' }), file);

        expect(screen.getByText('Failed to upload image')).toBeInTheDocument();
    });
});
