import React, { useState } from 'react';
import {
    Button,
    Card,
    CardActions,
    CardContent,
    CardMedia,
    Collapse,
    IconButton,
    Snackbar,
    TextField,
    Typography,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { UserProfile } from '../../pages';
import { UserWithId } from '../../models/user';
import { useRouter } from 'next/router';

interface UserProfileCardProps {
    userProfile: UserProfile;
    setUserProfile: (userProfile: UserProfile | undefined) => void;
    currentUser: UserWithId;
}

export default function UserProfileCardSchwer(props: UserProfileCardProps) {
    const { userProfile, setUserProfile, currentUser } = props;
    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState({ ...userProfile });
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const router = useRouter();

    const isCurrentUserProfile = currentUser.id === userProfile.id;

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const toggleEditMode = () => {
        if (
            editMode &&
            (editedUser.name !== userProfile.name ||
                editedUser.email !== userProfile.email ||
                editedUser.profileImageUrl !== userProfile.profileImageUrl)
        ) {
            setUserProfile({ ...editedUser });
            setSnackbarMessage('User edited successfully');
        }
        setEditMode(!editMode);
    };

    const handleEditUser = (value: string, key: keyof UserProfile) => {
        setEditedUser({
            ...editedUser,
            [key]: value,
        });
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;

        if (!file) {
            return;
        }

        if (file.size > 1048576) {
            setSnackbarMessage('File size should be less than 1MB');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        await fetch('https://example.com/api/upload-image', {
            method: 'POST',
            body: formData,
        })
            .then(async (response) => {
                if (!response.ok || response.status < 200 || response.status >= 300) {
                    throw new Error('Failed to upload image');
                }

                const data = await response.json();
                setEditedUser((prev) => ({ ...prev, profileImageUrl: data.profileImageUrl }));
            })
            .catch(() => {
                setSnackbarMessage('Failed to upload image');
            });
    };

    const handleProfilePageNavigation = async () => {
        await router.push(`http://localhost:3000/user?id=${userProfile.id}`);
    };

    const handleCloseSnackbar = () => {
        setSnackbarMessage('');
    };

    const handleDeleteUser = async () => {
        const isNotConfirmed = !window.confirm('Are you sure you want to delete the user?');
        if (isNotConfirmed) {
            return;
        }

        await fetch('https://example.com/api/user', {
            method: 'POST',
            body: JSON.stringify({ userId: userProfile.id }),
        })
            .then(async (response) => {
                if (!response.ok || response.status < 200 || response.status >= 300) {
                    throw new Error();
                }

                setUserProfile(undefined);
            })
            .catch(() => {
                setSnackbarMessage('Failed to delete user');
            });
    };

    const canDeleteUser = () => {
        const registrationTime = new Date(userProfile.registrationDate).getTime();
        const currentTime = Date.now();
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        return currentTime - registrationTime < dayInMilliseconds;
    };

    return (
        <Card sx={{ maxWidth: 345 }}>
            <CardMedia component='img' height='140' image={userProfile.profileImageUrl} alt='User profile image' />
            <CardContent>
                {editMode ? (
                    <>
                        <TextField
                            label='Name'
                            variant='outlined'
                            fullWidth
                            value={editedUser.name}
                            onChange={(e) => handleEditUser(e.target.value, 'name')}
                        />
                        <TextField
                            label='Email'
                            variant='outlined'
                            fullWidth
                            margin='normal'
                            value={editedUser.email}
                            onChange={(e) => handleEditUser(e.target.value, 'email')}
                        />
                        <Button sx={{ mt: 2 }} variant='contained' component='label'>
                            Change Profile Picture
                            <input type='file' hidden onChange={handleImageUpload} accept={'image/jpeg,image/png'} />
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography gutterBottom variant='h5' component='div'>
                            {userProfile.name}
                        </Typography>
                        <Typography variant='body2' color='text.secondary'>
                            Email: {userProfile.email}
                        </Typography>
                    </>
                )}
                <IconButton onClick={handleExpandClick} aria-expanded={expanded} aria-label='show more'>
                    <ExpandMoreIcon />
                </IconButton>
            </CardContent>
            <Collapse in={expanded} timeout='auto' unmountOnExit>
                <CardContent>
                    <Button onClick={handleProfilePageNavigation}>Show Profile Page</Button>
                    <Typography paragraph>
                        Registration Date: {new Date(userProfile.registrationDate).toLocaleDateString()}
                    </Typography>
                    <Typography paragraph>
                        Last Login Date: {new Date(userProfile.lastLoginDate).toLocaleDateString()}
                    </Typography>
                </CardContent>
            </Collapse>
            {isCurrentUserProfile && (
                <CardActions>
                    <Button size='small' onClick={toggleEditMode}>
                        {editMode ? 'Save' : 'Edit'}
                    </Button>
                    <Button size='small' disabled={canDeleteUser()} onClick={handleDeleteUser}>
                        Delete User
                    </Button>
                </CardActions>
            )}
            <Snackbar
                open={snackbarMessage.length > 0}
                message={snackbarMessage}
                action={
                    <IconButton size='small' aria-label='close' color='inherit' onClick={handleCloseSnackbar}>
                        <CloseIcon fontSize='small' />
                    </IconButton>
                }
            />
        </Card>
    );
}
