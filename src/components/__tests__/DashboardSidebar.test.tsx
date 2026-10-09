import { render, screen, within } from "@testing-library/react";
import DashboardSidebar from "../DashboardSidebar";

describe("DashboardSidebar", () => {
	it("exposes the dashboard navigation links and their destinations", () => {
		// Arrange
		render(<DashboardSidebar />);

		// Act
		const sidebar = screen.getByRole("complementary", { name: "Dashboard sidebar" });
		const navigation = within(sidebar).getByRole("navigation", { name: "Dashboard navigation" });
		const dashboardLink = within(navigation).getByRole("link", { name: "Dashboard" });
		const bookingsLink = within(navigation).getByRole("link", { name: "Bookings" });
		const activityLink = within(navigation).getByRole("link", { name: "Activity" });

		// Assert
		expect(within(navigation).getAllByRole("link")).toHaveLength(3);
		expect(dashboardLink).toHaveAttribute("href", "/");
		expect(dashboardLink).toHaveAttribute("aria-current", "page");
		expect(bookingsLink).toHaveAttribute("href", "/#bookings-heading");
		expect(activityLink).toHaveAttribute("href", "/#dashboard-activity");
	});
});