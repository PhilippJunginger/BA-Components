import React, { useState } from 'react';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    CardActions,
    Button,
    Collapse,
    IconButton,
    Snackbar,
    TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import { UserProfile } from '../../pages';
import { UserWithId } from '../../models/user';

interface UserProfileCardProps {
    userProfile: UserProfile;
    setUserProfile: (userProfile: UserProfile | undefined) => void;
    currentUser: UserWithId;
}

export default function UserProfileCardLeicht(props: UserProfileCardProps) {
    const { userProfile, setUserProfile, currentUser } = props;
    const [expanded, setExpanded] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editedUser, setEditedUser] = useState({ ...userProfile });
    const [snackbarMessage, setSnackbarMessage] = useState('');

    const isCurrentUserProfile = currentUser.id === userProfile.id;

    const handleExpandClick = () => {
        setExpanded(!expanded);
    };

    const toggleEditMode = () => {
        if (editMode && (editedUser.name !== userProfile.name || editedUser.email !== userProfile.email)) {
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

    const handleCloseSnackbar = () => {
        setSnackbarMessage('');
    };

    const handleDeleteUser = () => {
        setUserProfile(undefined);
    };

    const canDeleteUser = () => {
        const registrationTime = new Date(userProfile.registrationDate).getTime();
        const currentTime = Date.now();
        const dayInMilliseconds = 24 * 60 * 60 * 1000;
        return currentTime - registrationTime > dayInMilliseconds;
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
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
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
