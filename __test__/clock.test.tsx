import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import Clock from '../components/mittel/clock';

// Mocking global setInterval and clearInterval
jest.useFakeTimers();
jest.spyOn(global, 'setInterval');
jest.spyOn(global, 'clearInterval');

describe('Clock component tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    afterEach(() => {
        jest.clearAllTimers();
    });

    test('renders the clock and displays the current time', () => {
        const { rerender } = render(<Clock />);
        const initialTime = new Date().toLocaleTimeString();

        // Checking initial render for the current time
        expect(screen.getByText(`Es ist aktuell ${initialTime}`)).toBeInTheDocument();

        // Fast-forward time by 1 second to trigger the interval callback
        jest.advanceTimersByTime(1000);
        const newTime = new Date().toLocaleTimeString();
        rerender(<Clock />); // Rerender to update the displayed time

        expect(screen.getByText(`Es ist aktuell ${newTime}`)).toBeInTheDocument();
    });

    test('sets up and clears the interval', () => {
        const { unmount } = render(<Clock />);

        // Confirm setInterval was called
        expect(setInterval).toHaveBeenCalledTimes(1);
        expect(setInterval).toHaveBeenCalledWith(expect.any(Function), 1000);

        // Unmount the component to trigger cleanup
        unmount();

        // Confirm clearInterval was called
        expect(clearInterval).toHaveBeenCalledTimes(1);
    });
});
