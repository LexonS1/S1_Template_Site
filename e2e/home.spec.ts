import { test, expect } from "@playwright/test";

test.describe("Home page", () => {
	test("should load successfully", async ({ page }) => {
		await page.goto("/");
		await expect(page).toHaveTitle(/Next/);
	});

	test("should be accessible", async ({ page }) => {
		await page.goto("/");
		await expect(page.locator("body")).toBeVisible();
	});
});
