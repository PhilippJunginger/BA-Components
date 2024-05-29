import '@testing-library/jest-dom'
import {render, screen} from "@testing-library/react";
import Home from "../pages";


describe('', () => {


    it('should test', () => {
        render(<Home />)

        expect(screen.getByRole('')).toBeInTheDocument()
    })
})