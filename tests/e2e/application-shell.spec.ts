import { expect, test } from "@playwright/test";

test.describe("public pages", () => {
  test("home page links to login and signup", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: "Log in" }).first()).toHaveAttribute(
      "href",
      "/login",
    );
    await expect(page.getByRole("link", { name: "Sign up" }).first()).toHaveAttribute(
      "href",
      "/signup",
    );

    await page.getByRole("link", { name: "Log in" }).first().click();
    await expect(page).toHaveURL(/\/login$/);
  });

  test("login page renders an accessible email/password form", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Forgot password?" })).toHaveAttribute(
      "href",
      "/forgot-password",
    );
    await expect(page.getByRole("link", { name: "Sign up" })).toHaveAttribute("href", "/signup");
  });

  test("signup page renders all required fields", async ({ page }) => {
    await page.goto("/signup");

    await expect(page.getByLabel("Full name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Confirm password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  });

  test("forgot-password page renders an email field", async ({ page }) => {
    await page.goto("/forgot-password");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send reset link" })).toBeVisible();
  });

  test("an unknown route shows the friendly 404 page, not a stack trace", async ({ page }) => {
    const response = await page.goto("/this-route-does-not-exist");

    expect(response?.status()).toBe(404);
    await expect(page.getByText("Page not found")).toBeVisible();
    await expect(page.getByRole("link", { name: "Go home" })).toHaveAttribute("href", "/");
  });
});

test.describe("no console errors or hydration issues", () => {
  for (const path of ["/", "/login", "/signup", "/forgot-password"]) {
    test(`${path} renders without console errors`, async ({ page }) => {
      const errors: string[] = [];
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(message.text());
        }
      });
      page.on("pageerror", (error) => {
        errors.push(error.message);
      });

      await page.goto(path);
      await page.waitForLoadState("networkidle");

      expect(errors).toEqual([]);
    });
  }
});

test.describe("responsive layout", () => {
  test("login page remains usable at a 320px mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/login");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  });

  test("home page remains usable at a 320px mobile width", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "ReviewFlow AI" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
  });
});
