import { fireEvent, render, screen } from '@testing-library/react';
import LoginPage from '../javascript/LoginPage';

describe('LoginPage', () => {
	it('Displays the login form', () => {
		render(<LoginPage />);
		const field = screen.getByText("Username:");
		expect(field).toBeInTheDocument();
	});

	it('Displays the reset password form', () => {
		render(<LoginPage />);
		
		// click the forgetten password button
		const button = screen.getByRole("button", { name: "I've forgotten my password" })
		expect(button).toBeInTheDocument();
		screen.debug()

		fireEvent.click(button);

		const resetForm = screen.getByLabelText("Email:");
		expect(resetForm).toBeInTheDocument();
	})
});