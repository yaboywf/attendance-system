import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from '../javascript/Forms';
import axios from "axios";

jest.mock("axios");

describe('Forms Page', () => {
    it("should display the MC Form on default", () => {
        render(<LoginPage />);

        const reason = screen.queryByLabelText("Reason:");
        expect(reason).not.toBeInTheDocument();

        const start_date = screen.getByLabelText("Start Date:");
        expect(start_date).toBeInTheDocument();
    })

    it("should display the LOA Form when LOA is selected", () => {
        render(<LoginPage />);

        const loaToggle = screen.getByRole("radio", { name: "LOA" });
        expect(loaToggle).toBeInTheDocument();

        fireEvent.click(loaToggle);

        const reason = screen.getByLabelText("Reason:");
        expect(reason).toBeInTheDocument();
    })
})