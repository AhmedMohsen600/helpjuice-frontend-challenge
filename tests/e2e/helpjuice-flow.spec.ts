import { expect, test } from "@playwright/test";
import type { Locator, Page } from "@playwright/test";

const consoleErrorsByPage = new WeakMap<Page, string[]>();

async function expectLocatorInsideViewport(
  page: Page,
  locator: Locator,
) {
  const box = await locator.boundingBox();
  const viewport = page.viewportSize();

  expect(box).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (!box || !viewport) {
    throw new Error("Missing viewport layout metrics");
  }

  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
}

async function expectNoHorizontalScroll(page: Page) {
  const metrics = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: Math.max(
      document.documentElement.scrollWidth,
      document.body.scrollWidth,
    ),
  }));

  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 1);
}

function boxesOverlap(
  first: { x: number; y: number; width: number; height: number },
  second: { x: number; y: number; width: number; height: number },
) {
  return !(
    first.x + first.width <= second.x ||
    second.x + second.width <= first.x ||
    first.y + first.height <= second.y ||
    second.y + second.height <= first.y
  );
}

test.beforeEach(async ({ page }) => {
  const consoleErrors: string[] = [];
  consoleErrorsByPage.set(page, consoleErrors);

  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    consoleErrors.push(error.message);
  });
});

test.afterEach(async ({ page }) => {
  expect(consoleErrorsByPage.get(page) ?? []).toEqual([]);
});

test("keeps mobile block controls inside a narrow viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 667 });
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.hover();

  await expectLocatorInsideViewport(
    page,
    page.getByRole("button", { name: "Add block below" }),
  );
  await expectLocatorInsideViewport(
    page,
    page.getByRole("button", { name: "Drag Paragraph block" }),
  );
});

test("loads responsive viewports without horizontal document scroll", async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 930 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 430, height: 932 },
    { width: 390, height: 844 },
    { width: 320, height: 667 },
    { width: 390, height: 667 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");

    await expectNoHorizontalScroll(page);
  }
});

test("keeps mobile slash and block action menus inside the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/");

  const slashMenu = page.getByRole("menu", { name: "Add blocks" });
  await expect(slashMenu).toBeVisible();
  await expectLocatorInsideViewport(page, slashMenu);

  await page.keyboard.type("1");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Mobile action menu heading");

  const dragHandle = page.getByRole("button", { name: "Drag Heading 1 block" });
  await dragHandle.click();

  const blockActions = page.getByRole("menu", { name: "Block actions" });
  await expect(blockActions).toBeVisible();
  await expectLocatorInsideViewport(page, blockActions);
});

test("keeps the mobile slash menu visible near the bottom", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");

  await page.getByRole("textbox", { name: "Paragraph block" }).click();

  for (let index = 1; index <= 5; index += 1) {
    await page.keyboard.type("/1");
    await page.keyboard.press("Enter");
    await page.keyboard.type(`Short viewport heading ${index}`);
    await page.keyboard.press("Enter");
  }

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await expect(paragraph).toBeFocused();
  await page.keyboard.type("/");

  const menu = page.getByRole("menu", { name: "Add blocks" });
  await expect(menu).toBeVisible();
  await expectLocatorInsideViewport(page, menu);
  await expectNoHorizontalScroll(page);
});

test("lets mobile content grow and keeps the last block clear of help", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraphBlocks.first().click();

  for (let index = 1; index <= 8; index += 1) {
    await page.keyboard.type("/1");
    await page.keyboard.press("Enter");
    await page.keyboard.type(`Responsive heading ${index}`);
    await page.keyboard.press("Enter");
    await page.keyboard.type(
      `Responsive paragraph ${index} has enough text to make the document grow naturally.`,
    );
    await page.keyboard.press("Enter");
  }

  const scrollMetrics = await page.evaluate(() => ({
    scrollHeight: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
  }));
  expect(scrollMetrics.scrollHeight).toBeGreaterThan(
    scrollMetrics.viewportHeight * 1.5,
  );

  await page.evaluate(() =>
    window.scrollTo(0, document.documentElement.scrollHeight),
  );

  const lastBlockBox = await page.locator("[data-editor-block]").last().boundingBox();
  const helpBox = await page.getByRole("button", { name: "Help" }).boundingBox();

  expect(lastBlockBox).not.toBeNull();
  expect(helpBox).not.toBeNull();

  if (!lastBlockBox || !helpBox) {
    throw new Error("Missing last block or help button layout metrics");
  }

  expect(boxesOverlap(lastBlockBox, helpBox)).toBe(false);
  await expectNoHorizontalScroll(page);
});

test("wraps long mobile heading and paragraph text", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");

  const heading = page.getByRole("textbox", { name: "Heading 1 block" });
  await page.keyboard.type(
    "This is an intentionally long mobile heading with UnbrokenResponsiveHeadingTextThatMustWrapCleanly",
  );
  await page.keyboard.press("Enter");

  const bodyParagraph = page.getByRole("textbox", { name: "Paragraph block" });
  await page.keyboard.type(
    "This paragraph is intentionally long on a narrow screen and includes UnbrokenResponsiveParagraphTextThatMustWrapCleanlyWithoutCreatingHorizontalScroll.",
  );

  const headingBox = await heading.boundingBox();
  const paragraphBox = await bodyParagraph.boundingBox();

  expect(headingBox).not.toBeNull();
  expect(paragraphBox).not.toBeNull();

  if (!headingBox || !paragraphBox) {
    throw new Error("Missing long text layout metrics");
  }

  expect(headingBox.height).toBeGreaterThan(80);
  expect(paragraphBox.height).toBeGreaterThan(56);
  await expectNoHorizontalScroll(page);
});

test("supports dark mode and repeated heading creation on mobile", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 667 });
  await page.goto("/");

  const shell = page.getByTestId("editor-shell");
  await page.getByRole("button", { name: "Switch to dark mode" }).click();

  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(shell).toHaveCSS("background-color", "rgb(25, 25, 25)");
  await expectNoHorizontalScroll(page);

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  const headingBlocks = page.getByRole("textbox", { name: "Heading 1 block" });
  await paragraphBlocks.first().click();

  for (const [index, headingText] of [
    "First mobile heading",
    "Second mobile heading",
    "Third mobile heading",
  ].entries()) {
    await page.keyboard.type("/1");
    await page.keyboard.press("Enter");
    await expect(headingBlocks.nth(index)).toBeFocused();
    await page.keyboard.type(headingText);

    if (index < 2) {
      await page.keyboard.press("Enter");
      await page.keyboard.type(`Mobile paragraph ${index + 1}`);
      await page.keyboard.press("Enter");
    }
  }

  await expect(headingBlocks).toHaveCount(3);
  await expect(headingBlocks.nth(0)).toHaveText("First mobile heading");
  await expect(headingBlocks.nth(1)).toHaveText("Second mobile heading");
  await expect(headingBlocks.nth(2)).toHaveText("Third mobile heading");
  await expectNoHorizontalScroll(page);
});

test("completes the six-screen /1 to H1 flow", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Front-end developer test project",
    }),
  ).toBeVisible();
  await page.screenshot({ path: "test-results/helpjuice-01-initial.png" });

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/");
  await expect(page.getByRole("menu", { name: "Add blocks" })).toBeVisible();
  await page.screenshot({ path: "test-results/helpjuice-02-slash.png" });

  await page.keyboard.type("1");
  await expect(paragraph).toContainText("/1");
  await expect(page.getByText("Filtering keyword")).toBeVisible();
  await expect(page.getByTestId("filter-keyword-highlight")).toHaveText("1");
  await expect(
    page.getByRole("menu", { name: "Add blocks" }).getByRole("menuitemradio"),
  ).toHaveCount(1);
  await expect(
    page.getByRole("menuitemradio", { exact: true, name: "Heading 1" }),
  ).toHaveAttribute("aria-checked", "true");
  await page.screenshot({ path: "test-results/helpjuice-03-filtered.png" });

  await page.keyboard.press("Enter");
  const heading = page.getByRole("textbox", { name: "Heading 1 block" });
  await expect(heading).toBeFocused();
  await expect(heading).toHaveText("");
  await expect(page.getByRole("menu", { name: "Add blocks" })).toBeHidden();
  await page.screenshot({ path: "test-results/helpjuice-04-heading-empty.png" });

  await page.keyboard.type("This is my header");
  await expect(heading).toHaveText("This is my header");
  await page.screenshot({ path: "test-results/helpjuice-05-heading-text.png" });

  await page.keyboard.press("Enter");
  const nextParagraph = page.getByRole("textbox", { name: "Paragraph block" });
  await expect(nextParagraph).toBeFocused();
  await page.screenshot({
    path: "test-results/helpjuice-06-paragraph-empty.png",
  });
  await page.keyboard.type(
    "Now this is normal text. All I had to do is do / + 1, and then type my text and hit ENTER/RETURN",
  );
  await expect(nextParagraph).toHaveText(
    "Now this is normal text. All I had to do is do / + 1, and then type my text and hit ENTER/RETURN",
  );

  const headingWeight = await heading.evaluate((node) =>
    window.getComputedStyle(node).fontWeight,
  );
  const paragraphWeight = await nextParagraph.evaluate((node) =>
    window.getComputedStyle(node).fontWeight,
  );
  const headingFontSize = await heading.evaluate((node) =>
    window.getComputedStyle(node).fontSize,
  );
  const paragraphFontSize = await nextParagraph.evaluate((node) =>
    window.getComputedStyle(node).fontSize,
  );

  expect(headingWeight).not.toBe(paragraphWeight);
  expect(headingFontSize).not.toBe(paragraphFontSize);
  await page.screenshot({ path: "test-results/helpjuice-07-complete.png" });
});

test("turns slash-prefixed paragraph text into plain paragraph text", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/description");

  await expect(paragraph).toHaveText("description");
  await expect(page.getByRole("menu", { name: "Add blocks" })).toBeHidden();

  await page.keyboard.press("Enter");
  const paragraphs = page.getByRole("textbox", { name: "Paragraph block" });
  await expect(paragraphs).toHaveCount(2);
  await expect(paragraphs.nth(0)).toHaveText("description");
  await expect(paragraphs.nth(1)).toBeFocused();
});

test("keeps the slash menu in view after several headings", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Paragraph block" }).click();

  for (const headingText of [
    "Ahmed",
    "Ahmed mohsen",
    "1eewqe",
    "eqweqwe",
  ]) {
    await page.keyboard.type("/1");
    await expect(page.getByRole("menu", { name: "Add blocks" })).toBeVisible();
    await page.keyboard.press("Enter");
    await page.keyboard.type(headingText);
    await page.keyboard.press("Enter");
  }

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await expect(paragraph).toBeFocused();
  await page.keyboard.type("/");

  const menu = page.getByRole("menu", { name: "Add blocks" });
  await expect(menu).toBeVisible();

  const menuBox = await menu.boundingBox();
  const paragraphBox = await paragraph.boundingBox();
  const viewport = page.viewportSize();

  expect(menuBox).not.toBeNull();
  expect(paragraphBox).not.toBeNull();
  expect(viewport).not.toBeNull();

  if (!menuBox || !paragraphBox || !viewport) {
    throw new Error("Missing slash menu layout metrics");
  }

  expect(menuBox.y).toBeGreaterThanOrEqual(
    paragraphBox.y + paragraphBox.height + 8,
  );
  expect(menuBox.y + menuBox.height).toBeLessThanOrEqual(
    viewport.height - 16,
  );

  await page.screenshot({
    path: "test-results/helpjuice-08-menu-after-multiple-headings.png",
  });
});

test("shows a toast for visual-only chrome controls", async ({ page }) => {
  await page.goto("/");

  await page.getByRole("button", { name: "Publish Space" }).click();
  await expect(page.getByText("Not available in this prototype")).toBeVisible();
  const publishDescription = page.getByText(
    "Publish Space is visual-only in this challenge.",
  );
  await expect(publishDescription).toBeVisible();
  await expect(publishDescription).toHaveCSS("color", "rgb(75, 85, 101)");

  await page.getByRole("button", { name: "Page metadata toolbar" }).click();
  await expect(
    page.getByText("Page metadata is visual-only in this challenge."),
  ).toBeVisible();

  await page.getByRole("button", { name: "Help" }).click();
  await expect(
    page.getByText("Help is visual-only in this challenge."),
  ).toBeVisible();
});

test("toggles the editor into dark mode", async ({ page }) => {
  await page.goto("/");

  const shell = page.getByTestId("editor-shell");
  const title = page.getByRole("heading", {
    level: 1,
    name: "Front-end developer test project",
  });

  await expect(shell).toHaveCSS("background-color", "rgb(255, 255, 255)");

  await page.getByRole("button", { name: "Switch to dark mode" }).click();

  await expect(page.locator("html")).toHaveClass(/\bdark\b/);
  await expect(shell).toHaveCSS("background-color", "rgb(25, 25, 25)");
  await expect(title).toHaveCSS("color", "rgb(230, 230, 230)");

  await page.getByRole("textbox", { name: "Paragraph block" }).click();
  await page.keyboard.type("/1");

  const menu = page.getByRole("menu", { name: "Add blocks" });
  await expect(menu).toHaveCSS("background-color", "rgb(32, 32, 32)");
  await expect(
    page.getByRole("menuitemradio", { exact: true, name: "Heading 1" }),
  ).toHaveCSS("background-color", "rgb(47, 47, 47)");

  await page.getByRole("button", { name: "Switch to light mode" }).click();

  await expect(page.locator("html")).toHaveClass(/\blight\b/);
  await expect(shell).toHaveCSS("background-color", "rgb(255, 255, 255)");
});

test("supports the add affordance, heading levels, and block turn-into menu", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.hover();

  const addBlockButton = page.getByRole("button", { name: "Add block below" });
  await expect(addBlockButton).toBeVisible();
  await addBlockButton.click();

  await expect(page.getByRole("menu", { name: "Add blocks" })).toBeVisible();
  await expect(paragraph).toHaveText("/");

  await page.keyboard.type("4");
  await expect(page.getByTestId("filter-keyword-highlight")).toHaveText("4");
  await expect(
    page.getByRole("menuitemradio", { name: "Heading 4" }),
  ).toHaveAttribute(
    "aria-checked",
    "true",
  );

  await page.keyboard.press("Enter");

  const heading4 = page.getByRole("textbox", { name: "Heading 4 block" });
  await expect(heading4).toBeFocused();
  await page.keyboard.type("Small heading");
  await expect(heading4).toHaveText("Small heading");

  await page.getByRole("button", { name: "Drag Heading 4 block" }).click();
  const blockActions = page.getByRole("menu", { name: "Block actions" });
  await expect(blockActions).toBeVisible();
  await expect(blockActions.getByText("Turn into")).toBeVisible();

  await blockActions.getByRole("menuitemradio", { name: "Heading 2" }).click();

  const heading2 = page.getByRole("textbox", { name: "Heading 2 block" });
  await expect(heading2).toBeFocused();
  await expect(heading2).toHaveText("Small heading");

  await page.getByRole("button", { name: "Drag Heading 2 block" }).click();
  await page
    .getByRole("menu", { name: "Block actions" })
    .getByRole("menuitemradio", { name: "Paragraph / Text" })
    .click();

  const convertedParagraph = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await expect(convertedParagraph).toBeFocused();
  await expect(convertedParagraph).toHaveText("Small heading");
});

test("deletes a block from the drag handle action menu", async ({ page }) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });

  await paragraphBlocks.first().click();
  await page.keyboard.type("First paragraph");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Second paragraph");

  await expect(paragraphBlocks).toHaveCount(2);
  await expect(paragraphBlocks.nth(0)).toHaveText("First paragraph");
  await expect(paragraphBlocks.nth(1)).toHaveText("Second paragraph");

  await page
    .getByRole("button", { name: "Drag Paragraph block" })
    .first()
    .click();

  const blockActions = page.getByRole("menu", { name: "Block actions" });
  await expect(blockActions).toBeVisible();
  await blockActions.getByRole("menuitem", { name: "Delete" }).click();

  await expect(paragraphBlocks).toHaveCount(1);
  await expect(paragraphBlocks.first()).toHaveText("Second paragraph");
  await expect(paragraphBlocks.first()).toBeFocused();
  await expect(page.getByText("First paragraph")).toBeHidden();
});

test("keeps block controls reachable while moving from text to the plus icon", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  const addBlockButton = page.getByRole("button", { name: "Add block below" });

  await paragraph.hover();
  await expect(addBlockButton).toBeVisible();

  const paragraphBox = await paragraph.boundingBox();
  const addButtonBox = await addBlockButton.boundingBox();
  expect(paragraphBox).not.toBeNull();
  expect(addButtonBox).not.toBeNull();

  if (!paragraphBox || !addButtonBox) {
    throw new Error("Missing block hover layout metrics");
  }

  await page.mouse.move(
    paragraphBox.x + 6,
    paragraphBox.y + paragraphBox.height / 2,
  );
  await page.mouse.move(
    addButtonBox.x + addButtonBox.width / 2,
    addButtonBox.y + addButtonBox.height / 2,
    { steps: 12 },
  );

  await expect(addBlockButton).toBeVisible();
});

test("uses clickable and draggable cursors on editor side controls", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.hover();

  const addBlockButton = page.getByRole("button", { name: "Add block below" });
  const dragHandle = page.getByRole("button", {
    name: "Drag Paragraph block",
  });

  await expect(addBlockButton).toBeVisible();
  await addBlockButton.hover();
  await expect(addBlockButton).toHaveCSS("cursor", "pointer");

  await dragHandle.hover();
  await expect(dragHandle).toHaveCSS("cursor", "grab");

  await paragraph.click();
  await page.keyboard.type("Body text");

  const continuationHint = page.getByRole("button", {
    name: "Continue editing below",
  });
  await continuationHint.hover();

  const continuationPlus = continuationHint.locator(
    "[data-continuation-plus]",
  );
  const continuationDrag = continuationHint.locator(
    "[data-continuation-drag]",
  );

  await expect(continuationPlus).toBeVisible();
  await continuationPlus.hover();
  await expect(continuationPlus).toHaveCSS("cursor", "pointer");

  await expect(continuationDrag).toBeVisible();
  await continuationDrag.hover();
  await expect(continuationDrag).toHaveCSS("cursor", "grab");
});

test("keeps heading controls vertically centered across heading levels", async ({
  page,
}) => {
  await page.goto("/");

  await page.getByRole("textbox", { name: "Paragraph block" }).click();

  for (const [level, text] of [
    [1, "Ahmed"],
    [2, "Mohamed"],
    [3, "Sahir"],
    [4, "Osama"],
  ] as const) {
    await page.keyboard.type(`/${level}`);
    await page.keyboard.press("Enter");
    await page.keyboard.type(text);

    if (level < 4) {
      await page.keyboard.press("Enter");
    }
  }

  for (const level of [1, 2, 3, 4] as const) {
    const heading = page
      .getByRole("textbox", { name: `Heading ${level} block` })
      .first();
    const handle = page
      .getByRole("button", { name: `Drag Heading ${level} block` })
      .first();

    const headingBox = await heading.boundingBox();
    const handleBox = await handle.boundingBox();
    expect(headingBox).not.toBeNull();
    expect(handleBox).not.toBeNull();

    if (!headingBox || !handleBox) {
      throw new Error(`Missing heading ${level} layout metrics`);
    }

    const headingCenter = headingBox.y + headingBox.height / 2;
    const handleCenter = handleBox.y + handleBox.height / 2;
    expect(Math.abs(handleCenter - headingCenter)).toBeLessThanOrEqual(4);
  }
});

test("does not duplicate the empty paragraph when re-entering from an H1", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");

  const heading = page.getByRole("textbox", { name: "Heading 1 block" });
  await page.keyboard.type("ahe");
  await page.keyboard.press("Enter");

  const paragraphs = page.getByRole("textbox", { name: "Paragraph block" });
  await expect(paragraphs).toHaveCount(1);
  await expect(paragraphs.first()).toBeFocused();

  await heading.click();
  await page.keyboard.press("Enter");

  await expect(paragraphs).toHaveCount(1);
  await expect(paragraphs.first()).toBeFocused();
  await page.screenshot({
    path: "test-results/helpjuice-09-no-duplicate-empty-paragraph.png",
  });
});

test("does not create a stack of blank paragraphs when Enter repeats on an empty paragraph", async ({
  page,
}) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  const headingBlocks = page.getByRole("textbox", { name: "Heading 1 block" });

  await paragraphBlocks.first().click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Stable heading");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");

  await expect(headingBlocks).toHaveCount(1);
  await expect(paragraphBlocks).toHaveCount(1);
  await expect(paragraphBlocks.first()).toBeFocused();
});

test("does not insert a blank placeholder above existing paragraph text", async ({
  page,
}) => {
  await page.goto("/");

  const initialParagraph = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await initialParagraph.click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");

  const heading = page.getByRole("textbox", { name: "Heading 1 block" });
  await page.keyboard.type("eqwewq");
  await page.keyboard.press("Enter");

  const paragraphs = page.getByRole("textbox", { name: "Paragraph block" });
  await page.keyboard.type("eqwewqe");
  await expect(paragraphs).toHaveCount(1);
  await expect(paragraphs.first()).toHaveText("eqwewqe");

  await heading.click();
  await page.keyboard.press("Enter");

  await expect(paragraphs).toHaveCount(1);
  await expect(paragraphs.first()).toHaveText("eqwewqe");
  await expect(paragraphs.first()).toBeFocused();
  await page.screenshot({
    path: "test-results/helpjuice-10-no-placeholder-above-text.png",
  });
});

test("completes the expandable heading flow", async ({ page }) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/");

  const menu = page.getByRole("menu", { name: "Add blocks" });
  await expect(menu).toBeVisible();
  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("ArrowDown");
  }
  await expect(
    page.getByRole("menuitemradio", { name: "Expandable Heading 1" }),
  ).toHaveAttribute("aria-checked", "true");

  await page.keyboard.press("Enter");

  const expandableHeading = page.getByRole("textbox", {
    name: "Expandable Heading 1 block",
  });
  await expect(expandableHeading).toBeFocused();
  await expect(expandableHeading).toHaveText("");

  await page.keyboard.type("Expandable title");
  await expect(expandableHeading).toHaveText("Expandable title");

  await page.keyboard.press("Enter");
  const expandableBody = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await expect(expandableBody).toBeFocused();
  await page.keyboard.type("Expandable body");
  await expect(expandableBody).toHaveText("Expandable body");

  const toggle = page.getByRole("button", {
    name: "Toggle expandable heading",
  });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(expandableHeading).toHaveText("Expandable title");
  await expect(page.getByText("Expandable body")).toBeHidden();
  const continuationParagraph = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await expect(continuationParagraph).toBeFocused();

  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Expandable body")).toBeVisible();
  const restoredExpandableBody = page
    .getByRole("textbox", { name: "Paragraph block" })
    .filter({ hasText: "Expandable body" });

  await page.keyboard.press("Enter");
  await expect(restoredExpandableBody).toBeFocused();
});

test("creates an expandable heading with the /5 shortcut", async ({ page }) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/5");

  const menu = page.getByRole("menu", { name: "Add blocks" });
  await expect(menu.getByRole("menuitemradio")).toHaveCount(1);
  await expect(
    page.getByRole("menuitemradio", { name: "Expandable Heading 1" }),
  ).toHaveAttribute("aria-checked", "true");

  await page.keyboard.press("Enter");

  const expandableHeading = page.getByRole("textbox", {
    name: "Expandable Heading 1 block",
  });
  await expect(expandableHeading).toBeFocused();
  await expect(expandableHeading).toHaveText("");
  await expect(
    page.getByRole("button", { name: "Toggle expandable heading" }),
  ).toHaveAttribute("aria-expanded", "true");
});

test("can continue writing after a collapsed expandable heading", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/");

  for (let index = 0; index < 4; index += 1) {
    await page.keyboard.press("ArrowDown");
  }
  await page.keyboard.press("Enter");

  const expandableHeading = page.getByRole("textbox", {
    name: "Expandable Heading 1 block",
  });
  await expect(expandableHeading).toBeFocused();
  await page.keyboard.type("Collapsed group");
  await page.keyboard.press("Enter");

  const expandableBody = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await expect(expandableBody).toBeFocused();
  await page.keyboard.type("Hidden body");

  const toggle = page.getByRole("button", {
    name: "Toggle expandable heading",
  });
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Hidden body")).toBeHidden();

  const visibleParagraph = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await expect(visibleParagraph).toBeFocused();
  await expect(page.getByText("Hidden body")).toBeHidden();

  await page.keyboard.type("/1");
  await expect(page.getByRole("menu", { name: "Add blocks" })).toBeVisible();
  await page.keyboard.press("Enter");

  const headings = page.getByRole("textbox", {
    exact: true,
    name: "Heading 1 block",
  });
  await expect(headings).toHaveCount(1);
  await expect(headings.first()).toBeFocused();
  await page.keyboard.type("Heading after collapsed group");

  await expect(expandableHeading).toHaveText("Collapsed group");
  await expect(headings.first()).toHaveText("Heading after collapsed group");
  await expect(page.getByText("Hidden body")).toBeHidden();
});

test("can repeatedly create headings after paragraph text", async ({ page }) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  const headingBlocks = page.getByRole("textbox", { name: "Heading 1 block" });

  await paragraphBlocks.first().click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");
  await expect(headingBlocks).toHaveCount(1);
  await expect(headingBlocks.nth(0)).toBeFocused();
  await page.keyboard.type("First heading");
  await page.keyboard.press("Enter");
  await expect(paragraphBlocks).toHaveCount(1);
  await expect(paragraphBlocks.nth(0)).toBeFocused();
  await page.keyboard.type("First paragraph");
  await page.keyboard.press("Enter");
  await expect(paragraphBlocks).toHaveCount(2);
  await expect(paragraphBlocks.nth(1)).toBeFocused();

  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");
  await expect(headingBlocks).toHaveCount(2);
  await expect(headingBlocks.nth(1)).toBeFocused();
  await page.keyboard.type("Second heading");
  await page.keyboard.press("Enter");
  await expect(paragraphBlocks).toHaveCount(2);
  await expect(paragraphBlocks.nth(1)).toBeFocused();
  await page.keyboard.type("Second paragraph");
  await page.keyboard.press("Enter");
  await expect(paragraphBlocks).toHaveCount(3);
  await expect(paragraphBlocks.nth(2)).toBeFocused();

  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");
  await expect(headingBlocks).toHaveCount(3);
  await expect(headingBlocks.nth(2)).toBeFocused();
  await page.keyboard.type("Third heading");

  await expect(headingBlocks.nth(0)).toHaveText("First heading");
  await expect(paragraphBlocks.nth(0)).toHaveText("First paragraph");
  await expect(headingBlocks.nth(1)).toHaveText("Second heading");
  await expect(paragraphBlocks.nth(1)).toHaveText("Second paragraph");
  await expect(headingBlocks.nth(2)).toHaveText("Third heading");

  const orderedBlockTexts = await page
    .locator("[data-editor-block]")
    .evaluateAll((blocks) =>
      blocks.map((block) => block.textContent?.trim() ?? ""),
    );

  expect(orderedBlockTexts).toEqual([
    "First heading",
    "First paragraph",
    "Second heading",
    "Second paragraph",
    "Third heading",
  ]);
});

test("clicking blank editor space creates the next paragraph like Notion", async ({
  page,
}) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  const headingBlocks = page.getByRole("textbox", { name: "Heading 1 block" });

  await paragraphBlocks.first().click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Ahmed");
  await page.keyboard.press("Enter");

  await expect(paragraphBlocks).toHaveCount(1);
  await page.keyboard.type("mohsen");

  const continuationSurface = page.getByTestId("editor-continuation-surface");
  const surfaceBox = await continuationSurface.boundingBox();
  expect(surfaceBox).not.toBeNull();

  if (!surfaceBox) {
    throw new Error("Missing editor continuation surface metrics");
  }

  await continuationSurface.click({
    position: {
      x: surfaceBox.width / 2,
      y: surfaceBox.height - 48,
    },
  });

  await expect(paragraphBlocks).toHaveCount(2);
  await expect(paragraphBlocks.nth(1)).toBeFocused();
  await page.keyboard.type("eqeqwewqeqwe");

  await expect(headingBlocks.nth(0)).toHaveText("Ahmed");
  await expect(paragraphBlocks.nth(0)).toHaveText("mohsen");
  await expect(paragraphBlocks.nth(1)).toHaveText("eqeqwewqeqwe");
});

test("shows continuation actions below non-empty content before click", async ({
  page,
}) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraphBlocks.first().click();
  await page.keyboard.type("eqweq");

  const continuationHint = page.getByRole("button", {
    name: "Continue editing below",
  });
  await continuationHint.hover();

  await expect(continuationHint).toBeVisible();
  await expect(continuationHint.locator("[data-continuation-plus]")).toBeVisible();
  await expect(continuationHint.locator("[data-continuation-drag]")).toBeVisible();

  await continuationHint.click();

  await expect(paragraphBlocks).toHaveCount(2);
  await expect(paragraphBlocks.nth(0)).toHaveText("eqweq");
  await expect(paragraphBlocks.nth(1)).toBeFocused();
});

test("shows the paragraph placeholder only on the active empty block", async ({
  page,
}) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  const headingBlocks = page.getByRole("textbox", { name: "Heading 1 block" });

  await paragraphBlocks.first().click();
  await page.keyboard.type("/1");
  await page.keyboard.press("Enter");
  await page.keyboard.type("Placeholder visibility heading");
  await page.keyboard.press("Enter");

  await expect(paragraphBlocks).toHaveCount(1);
  await expect(paragraphBlocks.first()).toBeFocused();

  await headingBlocks.first().click();
  await expect(headingBlocks.first()).toBeFocused();

  const inactiveEmptyPlaceholder = await paragraphBlocks
    .first()
    .evaluate((node) => window.getComputedStyle(node, "::before").content);
  expect(inactiveEmptyPlaceholder).not.toContain("Type / for blocks");

  await paragraphBlocks.first().click();
  await expect(paragraphBlocks.first()).toBeFocused();

  const activeEmptyPlaceholder = await paragraphBlocks
    .first()
    .evaluate((node) => window.getComputedStyle(node, "::before").content);

  expect(activeEmptyPlaceholder).toContain("Type / for blocks");
});

test("reorders heading blocks by dragging the existing handle", async ({
  page,
}) => {
  await page.goto("/");

  const paragraphBlocks = page.getByRole("textbox", { name: "Paragraph block" });
  const headingBlocks = page.getByRole("textbox", { name: "Heading 1 block" });

  await paragraphBlocks.first().click();

  for (const [index, headingText] of ["First", "Second", "Third"].entries()) {
    await page.keyboard.type("/1");
    await page.keyboard.press("Enter");
    await page.keyboard.type(headingText);

    if (index < 2) {
      await page.keyboard.press("Enter");
    }
  }

  await expect(headingBlocks).toHaveCount(3);
  await expect(headingBlocks.nth(0)).toHaveText("First");
  await expect(headingBlocks.nth(1)).toHaveText("Second");
  await expect(headingBlocks.nth(2)).toHaveText("Third");

  const dragHandles = page.locator("[data-drag-handle]");
  await expect(dragHandles).toHaveCount(3);

  const sourceBox = await dragHandles.nth(0).boundingBox();
  const targetBox = await headingBlocks.nth(2).boundingBox();

  expect(sourceBox).not.toBeNull();
  expect(targetBox).not.toBeNull();

  if (!sourceBox || !targetBox) {
    throw new Error("Missing drag handle layout metrics");
  }

  await page.mouse.move(
    sourceBox.x + sourceBox.width / 2,
    sourceBox.y + sourceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    targetBox.x + targetBox.width / 2,
    targetBox.y + targetBox.height / 2,
    { steps: 14 },
  );
  await page.mouse.up();

  await expect
    .poll(() =>
      page
        .locator("[data-editor-block]")
        .evaluateAll((blocks) =>
          blocks.map((block) => block.textContent?.trim() ?? ""),
        ),
    )
    .toEqual(["Second", "Third", "First"]);
});
