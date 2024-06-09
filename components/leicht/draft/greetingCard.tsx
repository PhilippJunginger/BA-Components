import { useState } from 'react';
import { Box, MenuItem, Select, SxProps, Theme } from '@mui/material';

interface GreetingCardProps {
    name: string;
}

enum THEME_STYLES {
    LIGHT = 'light',
    DARK = 'dark',
    COLORFUL = 'colorful',
}

const themeStyles: {
    [THEME_STYLES.LIGHT]: SxProps<Theme>;
    [THEME_STYLES.DARK]: SxProps<Theme>;
    [THEME_STYLES.COLORFUL]: SxProps<Theme>;
} = {
    light: {
        backgroundColor: 'lavender',
        color: 'black',
    },
    dark: {
        backgroundColor: 'black',
        color: 'white',
    },
    colorful: {
        backgroundColor: 'pink',
        color: 'blue',
        fontFamily: 'Comic Sans MS',
    },
};

export default function GreetingCard({ name }: GreetingCardProps) {
    const [theme, setTheme] = useState<THEME_STYLES>(THEME_STYLES.LIGHT);

    const handleThemeSelection = (selectedTheme: THEME_STYLES) => {
        setTheme(selectedTheme);
    };

    return (
        <Box sx={{ padding: '20px', ...themeStyles[theme] }}>
            <h1>Herzlich willkommen, {name}!</h1>
            <Select
                sx={{ ...themeStyles[theme] }}
                value={theme}
                onChange={(e) => handleThemeSelection(e.target.value as THEME_STYLES)}>
                <MenuItem value='light'>Helles</MenuItem>
                <MenuItem value='dark'>Dunkles</MenuItem>
                <MenuItem value='colorful'>Buntes</MenuItem>
            </Select>
        </Box>
    );
}
