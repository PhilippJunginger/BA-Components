import { ChangeEvent, useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';

const amountOfNumbersToBeDrawn = 6;

export default function Lottospiel() {
    const [userNumbers, setUserNumbers] = useState<number[]>([]);
    const [number, setNumber] = useState<number | undefined>(undefined);
    const [error, setError] = useState<string>('');
    const [lottoResult, setLottoResult] = useState<number[]>([]);

    const handleLottoNumberInput = (e: ChangeEvent<HTMLInputElement>) => {
        const lottoNumber = +e.target.value;
        setNumber(lottoNumber);
    };

    const handlePlayAgain = () => {
        setUserNumbers([]);
        setNumber(undefined);
        setLottoResult([]);
    };

    const handleConfirmLottoNumber = (chosenNumber: number) => {
        if (userNumbers.includes(chosenNumber)) {
            setError('Each number can only be chosen once!');
            return;
        }

        const isNotInRange = chosenNumber < 1 || chosenNumber > 49;
        if (isNotInRange) {
            setError('The entered number has to be in the range of 1 to 49 inclusive.');
            return;
        }

        if (error) {
            setError('');
        }

        setUserNumbers([...userNumbers, chosenNumber]);
        setNumber(undefined);
    };

    const getRandomNumber = (lottoNumbers: number[]): number => {
        const randomNumber = Math.floor(Math.random() * 49);

        if (lottoNumbers.includes(randomNumber)) {
            return getRandomNumber(lottoNumbers);
        }

        return randomNumber;
    };

    const handleDraw = () => {
        const lottoNumbers: number[] = [];

        for (let i = 0; i < amountOfNumbersToBeDrawn; i++) {
            lottoNumbers.push(getRandomNumber(lottoNumbers));
        }

        setLottoResult(lottoNumbers);
    };

    const getLottoResultBackgroundColor = () => {
        if (!lottoResult.length) {
            return;
        }

        const isWinner = lottoResult.every((number) => userNumbers.includes(number));
        if (isWinner) {
            return 'green';
        }

        return 'coral';
    };

    return (
        <Box sx={{ backgroundColor: getLottoResultBackgroundColor(), height: 1, p: 3, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', gap: 3 }}>
                <TextField
                    value={number ?? ''}
                    onChange={handleLottoNumberInput}
                    label={'Enter Lotto number'}
                    error={!!error}
                    helperText={!!error.length && error}
                />

                <Button
                    startIcon={<Add />}
                    disabled={number === undefined || userNumbers.length === amountOfNumbersToBeDrawn}
                    onClick={() => number && handleConfirmLottoNumber(number)}>
                    Add Number
                </Button>
            </Box>

            <Box sx={{ minHeight: 40, gap: 1, display: 'flex', mt: 4 }}>
                {userNumbers.map((number) => (
                    <Box
                        key={number}
                        sx={{
                            width: 40,
                            height: 40,
                            border: 1,
                            display: 'flex',
                            backgroundColor: lottoResult.includes(number) ? 'green' : undefined,
                        }}>
                        <Typography sx={{ m: 'auto' }}>{number}</Typography>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {userNumbers.length === amountOfNumbersToBeDrawn && (
                    <Button variant={'outlined'} disabled={!!lottoResult.length} sx={{ mt: 4 }} onClick={handleDraw}>
                        Start Draw
                    </Button>
                )}

                {!!lottoResult.length && (
                    <Button sx={{ mt: 4 }} variant={'contained'} onClick={handlePlayAgain}>
                        Play again!
                    </Button>
                )}
            </Box>
        </Box>
    );
}
