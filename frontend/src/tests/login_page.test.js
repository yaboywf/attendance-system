import { render, screen } from '@testing-library/react';
import LoginPage from '../LoginPage';

test('renders login page', () => {
	render(<LoginPage />);
	const field = screen.getByText("Username:");
	expect(field).toBeInTheDocument();
});