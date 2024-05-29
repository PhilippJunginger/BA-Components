import { useState } from 'react';
import { Button } from '@mui/material';

interface CounterButtonProps {
    defaultCount: number;
}

export default function CounterButton(props: CounterButtonProps) {
    const [count, setCount] = useState(props.defaultCount);

    const handleButtonClick = () => {
        setCount(count + 1);
    };

    return <Button onClick={handleButtonClick}>Count is {count}</Button>;
}
