import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import BaseModal from "../BaseModal";

describe("BaseModal", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
			configurable: true,
			value: jest.fn(function (this: HTMLDialogElement) {
				this.setAttribute("open", "");
			}),
		});
		Object.defineProperty(HTMLDialogElement.prototype, "close", {
			configurable: true,
			value: jest.fn(function (this: HTMLDialogElement) {
				this.removeAttribute("open");
			}),
		});
	});

	it("calls the close callback when the accessible close control is activated", async () => {
		// Arrange
		const user = userEvent.setup();
		const onClose = jest.fn();
		render(
			<BaseModal isOpen onClose={onClose} title="Create booking">
				<p>Booking fields</p>
			</BaseModal>,
		);

		// Act
		await user.click(screen.getByRole("button", { name: "Close modal" }));

		// Assert
		expect(onClose).toHaveBeenCalledTimes(1);
	});

	it("does not expose a closed modal to the user", () => {
		// Arrange
		const onClose = jest.fn();

		// Act
		render(
			<BaseModal isOpen={false} onClose={onClose} title="Create booking">
				<p>Booking fields</p>
			</BaseModal>,
		);

		// Assert
		expect(screen.queryByRole("dialog", { name: "Create booking" })).not.toBeInTheDocument();
	});
});