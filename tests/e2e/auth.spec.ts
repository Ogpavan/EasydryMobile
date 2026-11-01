import { test, expect, type Page } from "@playwright/test";
async function start(page: Page) {
  await page.goto("/login");
  await page.getByRole("textbox", { name: "Mobile number" }).fill("9876543210");
  await page.getByRole("button", { name: "Continue with OTP" }).click();
  await expect(
    page.getByRole("textbox", { name: "Verification digit 1", exact: true }),
  ).toBeVisible();
}
test("incorrect OTP can be corrected using the demo-code action", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("textbox", { name: "Verification digit 1", exact: true })
    .pressSequentially("000000");
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "That code is incorrect" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Fill demo code", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Verification digit 1", exact: true }),
  ).toHaveValue("1");
  await expect(
    page.getByRole("textbox", { name: "Verification digit 6", exact: true }),
  ).toHaveValue("6");
  await expect(
    page.getByText("That code is incorrect", { exact: false }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(page).toHaveURL("/home");
});
test("six-digit autofill and page reload retain a valid demo challenge", async ({
  page,
}) => {
  await start(page);
  await page.reload();
  await page
    .getByRole("textbox", { name: "Verification digit 1", exact: true })
    .fill("123456");
  await expect(
    page.getByRole("textbox", { name: "Verification digit 6", exact: true }),
  ).toHaveValue("6");
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(page).toHaveURL("/home");
});
test("pasting a code fills all six positions", async ({ page }) => {
  await start(page);
  await page
    .getByRole("textbox", { name: "Verification digit 1", exact: true })
    .evaluate((el) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text", "123 456");
      el.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
  await expect(
    page.getByRole("textbox", { name: "Verification digit 6", exact: true }),
  ).toHaveValue("6");
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(page).toHaveURL("/home");
});
