import { expect, test } from "@playwright/test";

test.describe("apps page", () => {
  test("loads portfolio content", async ({ page }) => {
    await page.goto("/apps");

    await expect(page.getByRole("heading", { name: /selected/i })).toBeVisible();
    await expect(page.getByText("Vectra")).toBeVisible();
    await expect(page.getByText("Aura")).toBeVisible();
  });
});
