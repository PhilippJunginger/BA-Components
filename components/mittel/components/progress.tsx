import { Box, Grow, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import React from 'react';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import RoomPreferencesIcon from '@mui/icons-material/RoomPreferences';
import { useNavigate } from 'react-router-dom';

export enum FORM_TYPE {
    PERSONAL_INFORMATION = 'personal',
    FINANCIAL_INFORMATION = 'financial',
    LIVING_SITUATION = 'living',
    PREFERENCES = 'preferences',
}

interface ProgressProps {
    progressItems: {
        type: FORM_TYPE;
        isFilledOut: boolean;
    }[];
}

export default function Progress(props: ProgressProps) {
    const { progressItems } = props;
    const navigate = useNavigate();

    const handleProgressItemClick = (clickedType: FORM_TYPE) => {
        navigate(`/forms/${clickedType}`);
    };

    const getFormTypeIcon = (type: FORM_TYPE): React.JSX.Element => {
        switch (type) {
            case FORM_TYPE.PREFERENCES:
                return <RoomPreferencesIcon />;
            case FORM_TYPE.FINANCIAL_INFORMATION:
                return <WorkIcon />;
            case FORM_TYPE.LIVING_SITUATION:
                return <HomeIcon />;
            case FORM_TYPE.PERSONAL_INFORMATION:
                return <PersonIcon />;
        }
    };

    return (
        <Box sx={{ mx: 'auto', mb: 4, display: 'flex', gap: 1 }}>
            {progressItems.map(({ type, isFilledOut }) => (
                <Grow in={true} timeout={600} key={type}>
                    <IconButton
                        size={'large'}
                        aria-label={type}
                        onClick={() => handleProgressItemClick(type)}
                        sx={{
                            height: 1,
                            aspectRatio: '1/1',
                            border: 2,
                            minHeight: {
                                xs: 30,
                                sm: 45,
                                md: 60,
                            },
                            display: 'flex',
                            backgroundColor: isFilledOut ? 'green' : 'red',
                            justifyContent: 'center',
                            alignItems: 'center',
                            borderRadius: 2.5,
                        }}>
                        {getFormTypeIcon(type)}
                    </IconButton>
                </Grow>
            ))}
        </Box>
    );
}
