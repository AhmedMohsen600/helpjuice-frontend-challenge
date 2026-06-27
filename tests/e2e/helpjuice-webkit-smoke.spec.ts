import { expect, test } from "@playwright/test";

test("mobile WebKit editor smoke creates expandable content as plain text", async ({
  page,
}) => {
  await page.goto("/");

  const paragraph = page.getByRole("textbox", { name: "Paragraph block" });
  await paragraph.click();
  await page.keyboard.type("/5");

  const slashMenu = page.getByRole("menu", { name: "Add blocks" });
  await expect(slashMenu).toBeVisible();
  await expect(
    slashMenu.getByRole("menuitemradio", {
      name: "Expandable Heading 1",
    }),
  ).toHaveAttribute("aria-checked", "true");

  await page.keyboard.press("Enter");

  const expandableHeading = page.getByRole("textbox", {
    name: "Expandable Heading 1 block",
  });
  await expect(expandableHeading).toBeFocused();
  await page.keyboard.type("Mobile expandable");
  await page.keyboard.press("Enter");

  const expandableBody = page.getByRole("textbox", {
    name: "Paragraph block",
  });
  await expect(expandableBody).toBeFocused();
  await expandableBody.evaluate((node) => {
    node.innerHTML =
      '<span style="font-size: 200px">Styled <a href="https://example.com">paste</a></span><script>alert("nope")</script>';
    node.dispatchEvent(
      new InputEvent("input", {
        bubbles: true,
        inputType: "insertFromPaste",
      }),
    );
  });

  await expect(expandableBody).toHaveText("Styled paste");
  await expect(expandableBody.locator("*")).toHaveCount(0);

  const toggle = page.getByRole("button", {
    name: "Toggle expandable heading",
  });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByText("Styled paste")).toBeHidden();
});
