import { expect, test } from "@playwright/test";

test.describe("site navigation", () => {
  test("header links move between key pages", async ({ page }) => {
    await page.goto("/");

    const nav = page.getByRole("navigation");

    await nav.getByRole("button", { name: "Services", exact: true }).click();
    await nav.getByRole("menuitem", { name: "CRM", exact: true }).click();
    await expect(page).toHaveURL(/\/platform\/?$/);

    await nav.getByRole("button", { name: "Services", exact: true }).click();
    await nav.getByRole("menuitem", { name: "App Design", exact: true }).click();
    await expect(page).toHaveURL(/\/services\/?$/);
    await expect(
      page.getByRole("heading", { name: /engineering/i }),
    ).toBeVisible();

    await nav.getByRole("link", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/about\/?$/);
    await expect(
      page.getByRole("heading", { name: /trashbox/i }),
    ).toBeVisible();

    await nav.getByRole("link", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(
      page.getByRole("heading", { name: /trashbox llc/i }),
    ).toBeVisible();
  });
});
