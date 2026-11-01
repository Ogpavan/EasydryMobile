import { test, expect, type Page } from "@playwright/test";
async function login(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "Skip", exact: true }).click();
  await page.getByRole("textbox", { name: "Mobile number" }).fill("9876543210");
  await page.getByRole("button", { name: "Continue with OTP" }).click();
  await expect(
    page.getByRole("heading", { name: "You’re one code away from fresh." }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Verification digit 1", exact: true })
    .pressSequentially("123456");
  await page.getByRole("button", { name: "Verify & continue" }).click();
  await expect(page).toHaveURL("/home");
}
test("complete customer journey from onboarding to paid delivery", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await login(page);
  await page.screenshot({ path: "artifacts/home-390.png", fullPage: true });
  await page
    .getByRole("link", { name: "Schedule a pickup", exact: true })
    .click();
  await page.getByRole("button", { name: /Wash & Fold/ }).click();
  await page.getByRole("button", { name: /Wash & Iron/ }).click();
  await page.getByRole("button", { name: "Choose pickup time" }).click();
  await page.getByRole("button", { name: /Tomorrow/ }).click();
  await page
    .getByRole("button", { name: "9:00 AM – 11:00 AM", exact: true })
    .click();
  await page.getByRole("button", { name: "Choose pickup address" }).click();
  await page
    .getByRole("button", { name: "Confirm pickup", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Fresh plans. Pickup confirmed." }),
  ).toBeVisible();
  await page.getByRole("link", { name: "View pickup request" }).click();
  await expect(
    page.getByText("There’s no invoice yet.", { exact: false }),
  ).toBeVisible();
  const requestUrl = page.url();
  await page.getByRole("link", { name: "Reschedule", exact: true }).click();
  await page
    .getByRole("group", { name: "Pickup date" })
    .getByRole("button")
    .nth(2)
    .click();
  await page
    .getByRole("button", { name: "2:00 PM – 4:00 PM", exact: true })
    .click();
  await page.getByRole("button", { name: "Confirm new pickup time" }).click();
  await expect(page).toHaveURL(requestUrl);
  await page.reload();
  await expect(
    page.getByText("2:00 PM – 4:00 PM", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Simulate pickup & assessment" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your itemized invoice" }),
  ).toBeVisible();
  const orderUrl = page.url();
  await page
    .getByRole("link", { name: "Have a coupon?", exact: false })
    .click();
  await page
    .locator(".coupon-card")
    .filter({ hasText: "FRESH20" })
    .getByRole("button", { name: "Apply", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Applied", exact: true }),
  ).toBeVisible();
  await page.goBack();
  await page.getByRole("button", { name: "Pay now", exact: false }).click();
  await page
    .getByRole("checkbox", { name: "Simulate a declined payment" })
    .check();
  await page.getByRole("button", { name: /Simulate payment ·/ }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "declined" }),
  ).toBeVisible();
  await page
    .getByRole("checkbox", { name: "Simulate a declined payment" })
    .uncheck();
  await page.getByRole("button", { name: /Simulate payment ·/ }).click();
  await expect(
    page.getByRole("heading", { name: "All settled." }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  await page.getByRole("link", { name: /See your laundry’s journey/ }).click();
  for (const name of [
    "Simulate cleaning in progress",
    "Simulate ready for delivery",
    "Simulate out for delivery",
    "Simulate delivered",
  ])
    await page.getByRole("button", { name, exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Fresh clothes. Happy days." }),
  ).toBeVisible();
  await page.locator("label").filter({ hasText: "5 Stars" }).click();
  await expect(
    page.getByText("Thanks for sharing a little love."),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/delivered-390.png",
    fullPage: true,
  });
  await page.goto(requestUrl + "/cancel");
  await expect(
    page.getByRole("heading", { name: "Cancellation unavailable" }),
  ).toBeVisible();
  await page.goto(orderUrl);
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});
test("packages, profile, addresses, support and cancellation", async ({
  page,
}) => {
  await login(page);
  await page.goto("/packages");
  await page
    .locator(".package-card")
    .first()
    .getByRole("button", { name: "Get this plan" })
    .click();
  await page.getByRole("button", { name: /Simulate payment ·/ }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(
    page.locator(".balance-card").getByText("₹1,100", { exact: true }),
  ).toBeVisible();
  await page.goto("/orders/ED-1024");
  await page.getByRole("button", { name: "Use credit", exact: true }).click();
  await expect(page.getByText("Paid", { exact: true })).toBeVisible();
  await page.goto("/account");
  await page.getByRole("button", { name: "Edit profile" }).click();
  await page.getByRole("textbox", { name: "Full name" }).fill("Priya Sharma");
  await page
    .getByRole("textbox", { name: "Email address (optional)" })
    .fill("priya@example.com");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(
    page.getByRole("heading", { name: "Priya Sharma" }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Manage addresses/ }).click();
  await page.getByRole("button", { name: "Add new address" }).click();
  for (const [label, value] of [
    ["Address label", "Parents"],
    ["Contact number", "9876543210"],
    ["Building, flat & street", "12, Lake View Road"],
    ["Area / locality", "HSR Layout"],
    ["City", "Bengaluru"],
    ["State", "Karnataka"],
    ["Pincode", "560102"],
  ])
    await page.getByRole("textbox", { name: label, exact: true }).fill(value);
  await page.getByRole("button", { name: "Save address", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Select Parents address" }),
  ).toBeVisible();
  await page.goto("/support?reference=PU-2048");
  await page
    .getByRole("textbox", { name: "Subject" })
    .fill("Pickup instructions");
  await page
    .getByRole("textbox", { name: "How can we help?" })
    .fill("Please call me when you arrive at the apartment gate.");
  await page.getByRole("button", { name: "Submit demo ticket" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "saved locally" }),
  ).toBeVisible();
  await page.goto("/requests/PU-2048/cancel");
  await page
    .getByRole("radio", { name: "My plans have changed", exact: true })
    .check();
  await page
    .getByRole("button", { name: "Cancel pickup", exact: true })
    .click();
  await page.getByRole("button", { name: "Yes, cancel pickup" }).click();
  await expect(page.getByText("Cancelled", { exact: true })).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("switch", { name: "Offer notifications" }).check();
  await page.reload();
  await expect(
    page.getByRole("switch", { name: "Offer notifications" }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page
    .getByRole("dialog")
    .getByRole("button", { name: "Log out", exact: true })
    .click();
  await expect(page).toHaveURL("/login");
});
for (const width of [360, 390, 412, 430])
  test(`responsive screens have no horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await login(page);
    for (const path of [
      "/home",
      "/booking/services",
      "/booking/schedule",
      "/booking/address",
      "/requests",
      "/requests/PU-2048",
      "/requests/PU-2048/reschedule",
      "/requests/PU-2048/cancel",
      "/orders",
      "/orders/ED-1024",
      "/orders/ED-1024/tracking",
      "/orders/ED-0982/delivered",
      "/packages",
      "/offers",
      "/account",
      "/addresses",
      "/support",
      "/settings",
      "/notifications",
      "/payment-methods",
      "/legal/privacy",
    ]) {
      await page.goto(path);
      await expect(page.locator("main")).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${path} overflows at ${width}`,
      ).toBe(true);
      expect(
        await page
          .locator("main")
          .evaluate((el) => el.scrollWidth <= el.clientWidth),
        `${path} content overflows at ${width}`,
      ).toBe(true);
      if (width === 390)
        await page.screenshot({
          path: `artifacts/screen${path.replaceAll("/", "-")}.png`,
          fullPage: true,
        });
    }
    await page.goto("/home");
    await page.screenshot({
      path: `artifacts/home-${width}.png`,
      fullPage: true,
    });
    await page
      .getByRole("link", { name: "Schedule a pickup", exact: true })
      .click();
    await page.getByRole("button", { name: /Wash & Fold/ }).click();
    await page.getByRole("button", { name: "Choose pickup time" }).click();
    await page.getByRole("button", { name: /Tomorrow/ }).click();
    await page
      .getByRole("button", { name: "9:00 AM – 11:00 AM", exact: true })
      .click();
    await page.getByRole("button", { name: "Choose pickup address" }).click();
    await page
      .getByRole("button", { name: "Confirm pickup", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Fresh plans. Pickup confirmed." }),
    ).toBeVisible();
    expect(
      await page
        .locator("main")
        .evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
    await page.screenshot({
      path: `artifacts/confirmation-${width}.png`,
      fullPage: true,
    });
  });
