import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';

export default function Clock() {
    const [date, setDate] = useState<Date>(new Date());

    useEffect(() => {
        const timerId = setInterval(() => setDate(new Date()), 1000);

        return () => clearInterval(timerId);
    }, []);

    return (
        <Box>
            <Typography>Es ist aktuell {date.toLocaleTimeString()}</Typography>
        </Box>
    );
}
