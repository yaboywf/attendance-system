import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import LoginPage from '../javascript/LoginPage';
import axios from "axios";

jest.mock("axios");

describe('Login Page', () => {
	const originalLocation = window.location;
	beforeAll(() => {
		process.env.NODE_ENV = "test";
		delete window.location;
		window.location = { href: "" };
	});

	afterAll(() => {
		window.location = originalLocation;
	});

	afterEach(() => {
		jest.resetAllMocks();
	});

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

		fireEvent.click(button);

		const resetForm = screen.getByLabelText("Email:");
		expect(resetForm).toBeInTheDocument();
	});

	it("Should be able to login", async () => {
		render(<LoginPage />);

		const mockResponse = {
			data: {
				status: "success",
				user: {
					id: 0,
					username: "John Doe",
					password: "password123"
				}
			}
		};

		axios.post.mockResolvedValueOnce(mockResponse);

		const username = screen.getByLabelText("Username:");
		const password = screen.getByLabelText("Password:");
		const button = screen.getByRole("button", { name: "Login" });

		expect(username).toBeInTheDocument();
		expect(password).toBeInTheDocument();
		expect(button).toBeInTheDocument();

		fireEvent.change(username, { target: { value: "John Doe" } });
		fireEvent.change(password, { target: { value: "password123" } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(axios.post).toHaveBeenCalledTimes(1);
			expect(axios.post).toHaveBeenCalledWith(
				"http://127.0.0.1:3000/api/authenticate",
				{
					username: "John Doe",
					password: "password123",
				}
			);
		});

		await waitFor(() => {
			expect(window.location.href).toBe('/dashboard');
		});
	})

	it("Should show error message for invalid login credentials", async () => {
		render(<LoginPage />);

		const mockResponse = {
			status: 401,
			data: {
				status: "fail",
			}
		};

		axios.post.mockRejectedValueOnce({ response: mockResponse });

		const username = screen.getByLabelText("Username:");
		const password = screen.getByLabelText("Password:");
		const button = screen.getByRole("button", { name: "Login" });

		expect(username).toBeInTheDocument();
		expect(password).toBeInTheDocument();
		expect(button).toBeInTheDocument();

		fireEvent.change(username, { target: { value: "testuser" } });
		fireEvent.change(password, { target: { value: "testpassword" } });
		fireEvent.click(button);

		await waitFor(() => {
			expect(axios.post).toHaveBeenCalledTimes(1);
			expect(axios.post).toHaveBeenCalledWith(
				"http://127.0.0.1:3000/api/authenticate",
				{
					username: "testuser",
					password: "testpassword",
				}
			);
		});

		await waitFor(() => {
			expect(screen.getByText("Incorrect username or password")).toBeInTheDocument();
		});
	})
});