import { expect, test } from "@playwright/test";

test.describe("about page", () => {
  test("loads founder story and mission", async ({ page }) => {
    await page.goto("/about");

    await expect(page.getByRole("heading", { name: /trashbox/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /ezekiel mohr/i })).toBeVisible();
    await expect(page.getByText(/amazon leo/i)).toBeVisible();
    await expect(page.getByRole("link", { name: /start a project/i })).toBeVisible();
  });
});
