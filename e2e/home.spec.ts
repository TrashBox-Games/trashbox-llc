import { expect, test } from "@playwright/test";

test.describe("home page", () => {
  test("loads brand and primary navigation", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");

    await expect(page.getByRole("heading", { name: /trashbox llc/i })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Trashbox LLC home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Services", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "About", exact: true })).toBeVisible();
  });
});
