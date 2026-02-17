import { expect, test } from "@playwright/test";

test("home page renders navigation and route entry cards", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("link", { name: "Home" })).toBeVisible();
  await expect(page.getByRole("link", { name: "About" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Portfolio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Agent" })).toBeVisible();

  await expect(page.getByRole("heading", { name: /Thabiso Nathaniel Seleke/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to Portfolio" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Open Agent" })).toBeVisible();
});

test("agent chat interaction streams and renders answer", async ({ page }) => {
  await page.route("**/api/chat/stream", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "text/event-stream",
      body: [
        'data: {"type":"session","sessionId":"test-session"}',
        '',
        'data: {"type":"chunk","text":"Thabiso has production experience "}',
        '',
        'data: {"type":"chunk","text":"with Java and Angular."}',
        '',
        'data: {"type":"citations","citations":["Experience","Skills"]}',
        '',
        'data: {"type":"done"}',
        ''
      ].join("\n")
    });
  });

  await page.goto("/agent");

  await page.getByRole("button", { name: "What collaboration services does Thabiso offer?" }).click();
  await expect(page.getByText("Thabiso has production experience with Java and Angular.")).toBeVisible();
  await expect(page.getByText("Sources: Experience, Skills")).toBeVisible();
});

test("portfolio page renders project cards", async ({ page }) => {
  await page.goto("/portfolio");

  await expect(page.getByRole("heading", { name: "Project Work" })).toBeVisible();
  await expect(page.getByText("Cyberbiso/Tourism")).toBeVisible();
  await expect(page.getByText("Cyberbiso/Bank-System-")).toBeVisible();
  await expect(page.getByText("Cyberbiso/Video-Game-Discovery")).toBeVisible();
  await expect(page.getByText("Cyberbiso/will-you-be-my-valentine")).toBeVisible();
});
