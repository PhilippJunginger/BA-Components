import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Lottospiel from '../components/mittel/lottospiel';
import '@testing-library/jest-dom';

describe('Lottospiel component tests', () => {
    const user = userEvent.setup();
    beforeEach(() => {
        // eslint-disable-next-line testing-library/no-render-in-lifecycle
        render(<Lottospiel />);
    });

    it('should display initial elements correctly', () => {
        expect(screen.getByRole('textbox', { name: 'Enter Lotto number' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Add Number' })).toBeDisabled();
        expect(screen.queryByText('Start Draw')).toBeNull();
    });

    it('should allow adding a valid number and display it', async () => {
        const numberInput = screen.getByRole('textbox', { name: 'Enter Lotto number' });
        await user.type(numberInput, '15');
        await user.click(screen.getByRole('button', { name: 'Add Number' }));

        expect(screen.getByText('15')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'Start Draw' })).toBeNull();
    });

    it('should display an error message when entering a duplicate number', async () => {
        const numberInput = screen.getByRole('textbox', { name: 'Enter Lotto number' });
        await user.type(numberInput, '10');
        await user.click(screen.getByRole('button', { name: 'Add Number' }));
        await user.clear(numberInput);
        await user.type(numberInput, '10');
        await user.click(screen.getByRole('button', { name: 'Add Number' }));

        expect(screen.getByText('Each number can only be chosen once!')).toBeInTheDocument();
    });

    it('should display an error message when entering a number out of range', async () => {
        const numberInput = screen.getByRole('textbox', { name: 'Enter Lotto number' });
        await user.type(numberInput, '100');
        await user.click(screen.getByRole('button', { name: 'Add Number' }));

        expect(screen.getByText('The entered number has to be in the range of 1 to 49 inclusive.')).toBeInTheDocument();
    });

    it('should enable the Start Draw button when the correct amount of numbers is added', async () => {
        const numberInput = screen.getByRole('textbox', { name: 'Enter Lotto number' });
        for (let i = 1; i <= 6; i++) {
            await user.type(numberInput, `${i}`);
            await user.click(screen.getByRole('button', { name: 'Add Number' }));
            await user.clear(numberInput);
        }

        expect(screen.getByRole('button', { name: 'Start Draw' })).toBeEnabled();
    });

    it.skip('should show a green or coral background depending on the draw result', async () => {
        // Adding numbers
        const numberInput = screen.getByRole('textbox', { name: 'Enter Lotto number' });
        for (let i = 1; i <= 6; i++) {
            await user.type(numberInput, `${i}`);
            await user.click(screen.getByRole('button', { name: 'Add Number' }));
            await user.clear(numberInput);
        }

        // Simulating draw
        await user.click(screen.getByRole('button', { name: 'Start Draw' }));

        // eslint-disable-next-line testing-library/no-node-access
        const lottoBackground = screen.getByRole('box').parentNode;
        expect(lottoBackground).toHaveStyle({ backgroundColor: expect.stringMatching(/green|coral/) });
    });

    it('should reset the game when the Play again button is clicked', async () => {
        // Completing a game simulation
        const numberInput = screen.getByRole('textbox', { name: 'Enter Lotto number' });
        for (let i = 1; i <= 6; i++) {
            await user.type(numberInput, `${i}`);
            await user.click(screen.getByRole('button', { name: 'Add Number' }));
            await user.clear(numberInput);
        }
        await user.click(screen.getByRole('button', { name: 'Start Draw' }));

        // Resetting the game
        await user.click(screen.getByRole('button', { name: 'Play again!' }));

        expect(screen.getByRole('textbox', { name: 'Enter Lotto number' })).toHaveValue('');
        expect(screen.queryByText('Start Draw')).toBeNull();
        expect(screen.queryByRole('button', { name: 'Play again!' })).toBeNull();
    });
});
