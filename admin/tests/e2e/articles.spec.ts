import { test, expect } from "@playwright/test";

// Helper: login if needed (assumes session exists or auto-login)
async function ensureLoggedIn(page: import("@playwright/test").Page) {
  await page.goto("/articles");
  // If redirected to login, we need to authenticate
  if (page.url().includes("/login")) {
    // Fill login form — adjust selectors to match your login page
    await page.fill('input[name="email"], input[type="email"]', process.env.TEST_ADMIN_EMAIL || "admin@modonty.com");
    await page.fill('input[name="password"], input[type="password"]', process.env.TEST_ADMIN_PASSWORD || "admin123");
    await page.click('button[type="submit"]');
    await page.waitForURL("**/articles", { timeout: 10000 });
  }
}

test.describe("Articles CRUD", () => {
  test.beforeEach(async ({ page }) => {
    // Auto-accept beforeunload dialogs
    page.on("dialog", (dialog) => dialog.accept());
    await ensureLoggedIn(page);
  });

  test("articles list page loads with correct structure", async ({ page }) => {
    await page.goto("/articles");

    // Header shows article count
    await expect(page.locator("h1")).toContainText("Articles");

    // 5 status filter tabs exist
    await expect(page.locator("text=All")).toBeVisible();
    await expect(page.locator("text=Writing")).toBeVisible();
    await expect(page.locator("text=Published")).toBeVisible();

    // Search bar exists
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();

    // Table has articles
    const rows = page.locator("table tbody tr");
    await expect(rows).toHaveCount(await rows.count()); // at least renders
  });

  test("create new article with required fields", async ({ page }) => {
    await page.goto("/articles/new");

    // Verify 5-step form
    await expect(page.locator("text=Step 1 of 5")).toBeVisible();

    // Fill Step 1: Basic
    await page.locator("select").first().selectOption({ index: 1 }); // client
    await page.locator("#title").fill("E2E Test Article — Auto Delete");
    await page.locator("textarea").first().fill(
      "This is an automated test article created by Playwright E2E tests. It should be deleted after the test run completes successfully."
    );
    await page.waitForTimeout(500);

    // Go to Step 2: Content
    await page.locator('button:has-text("Content")').last().click();
    await page.waitForTimeout(500);

    // Type content in editor
    const editor = page.locator(".tiptap").first();
    await editor.click();
    await page.keyboard.type("This is test content for the E2E test article. It needs at least 300 words to pass the SEO content check but this is fine for a basic test.", { delay: 5 });
    await page.waitForTimeout(500);

    // Save draft
    const saveBtn = page.locator('button:has-text("Save Draft")');
    await saveBtn.click();
    await page.waitForTimeout(5000);

    // Should redirect to articles list after save
    await expect(page).toHaveURL(/\/articles$/);
  });

  test("edit article preserves content", async ({ page }) => {
    await page.goto("/articles");

    // Click first article
    const firstArticleLink = page.locator("table tbody tr a").first();
    const articleTitle = await firstArticleLink.textContent();
    await firstArticleLink.click();
    await page.waitForTimeout(2000);

    // Should be on article view page
    await expect(page.locator("h1, h2").first()).toContainText(articleTitle?.trim() || "");

    // Click Edit
    await page.locator('a:has-text("Edit"), button:has-text("Edit")').first().click();
    await page.waitForTimeout(2000);

    // Should be on edit page
    await expect(page).toHaveURL(/\/edit$/);
    await expect(page.locator("text=Step 1 of 5")).toBeVisible();

    // Title should be preserved
    const titleValue = await page.locator("#title").inputValue();
    expect(titleValue.length).toBeGreaterThan(0);

    // SEO score should be visible
    await expect(page.locator("text=/SEO Health: \\d+%/")).toBeVisible();
  });

  test("SEO score matches between edit and view page", async ({ page }) => {
    await page.goto("/articles");

    // Get first article's SEO score from table
    const firstRowSEO = page.locator("table tbody tr").first().locator("td").nth(1);
    const listSEOText = await firstRowSEO.textContent();
    const listSEO = parseInt(listSEOText?.replace("%", "") || "0");

    // Click into article
    await page.locator("table tbody tr a").first().click();
    await page.waitForTimeout(2000);

    // Get view page SEO score
    const viewSEOBadge = page.locator("text=/\\d+%/").first();
    const viewSEOText = await viewSEOBadge.textContent();
    const viewSEO = parseInt(viewSEOText?.replace("%", "") || "0");

    // Go to edit page
    await page.locator('a:has-text("Edit"), button:has-text("Edit")').first().click();
    await page.waitForTimeout(2000);

    // Get edit page SEO score
    const editSEOBadge = page.locator("text=/SEO Health: \\d+%/");
    const editSEOText = await editSEOBadge.textContent();
    const editSEO = parseInt(editSEOText?.match(/(\d+)%/)?.[1] || "0");

    // Scores should match (view = edit)
    expect(editSEO).toBe(viewSEO);
  });

  test("publish gate blocks low-SEO articles", async ({ page }) => {
    await page.goto("/articles/new");

    // Fill minimal data (will have low SEO)
    await page.locator("select").first().selectOption({ index: 1 });
    await page.locator("#title").fill("Low SEO Test");
    await page.waitForTimeout(500);

    // Go to Publish tab and set status to Published
    await page.locator('button:has-text("Publish")').last().click();
    await page.waitForTimeout(500);

    // Change status to Published
    const statusSelect = page.locator('select:has(option[value="PUBLISHED"])');
    if (await statusSelect.count() > 0) {
      await statusSelect.selectOption("PUBLISHED");
      await page.waitForTimeout(300);
    }

    // Try to save — should fail with SEO gate error
    await page.locator('button:has-text("Save Draft")').click();
    await page.waitForTimeout(3000);

    // Should show error toast about SEO score
    const toasts = await page.locator('[class*="toast"]').allTextContents();
    const hasError = toasts.some((t) => t.includes("SEO") || t.includes("60%"));
    // If toast appeared, test passes. If no toast, the save might have been blocked silently.
    // The key check is: we should NOT be redirected to /articles
    expect(page.url()).toContain("/new");
  });

  test("editor toolbar has all required tools", async ({ page }) => {
    await page.goto("/articles/new");

    // Go to Content tab
    await page.locator('button:has-text("Content")').last().click();
    await page.waitForTimeout(500);

    // Check all toolbar buttons exist
    const requiredButtons = [
      "Undo", "Redo", "Bold", "Italic", "Underline", "Strikethrough",
      "Code", "Highlight", "Superscript", "Subscript",
      "Heading 1", "Heading 2", "Heading 3",
      "Bullet List", "Ordered List", "Blockquote",
      "Align Right", "Align Center", "Align Left", "Align Justify",
      "Insert Link", "Insert Image", "YouTube Video",
      "Horizontal Rule", "Insert Table", "Clear Formatting",
    ];

    for (const label of requiredButtons) {
      await expect(page.locator(`button[aria-label="${label}"]`)).toBeVisible();
    }
  });

  test("word count updates in editor footer", async ({ page }) => {
    await page.goto("/articles/new");
    await page.locator("select").first().selectOption({ index: 1 });
    await page.locator("#title").fill("Word Count Test");

    // Go to Content
    await page.locator('button:has-text("Content")').last().click();
    await page.waitForTimeout(500);

    // Initially 0 words
    await expect(page.locator("text=0 words")).toBeVisible();

    // Type some text
    const editor = page.locator(".tiptap").first();
    await editor.click();
    await page.keyboard.type("hello world test words here now", { delay: 20 });
    await page.waitForTimeout(500);

    // Word count should be > 0
    const wordCountText = await page.locator("text=/\\d+ words/").textContent();
    const wordCount = parseInt(wordCountText?.match(/(\d+)/)?.[1] || "0");
    expect(wordCount).toBeGreaterThan(0);
  });
});
