import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  createExpandableHeading,
  getEditableBlocks,
  renderEditor,
  selectCommand,
  typeSlashCommand,
} from "./test-utils";

describe("editor expandable heading flow", () => {
  it("selects Expandable Heading 1 and creates a focused expandable heading block", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user, "/");
    await selectCommand(user, "Expandable Heading 1");

    const heading = screen.getByRole("textbox", {
      name: "Expandable Heading 1 block",
    });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(heading).toHaveAttribute("data-placeholder", "Heading 1");
    expect(screen.queryByText("/1")).not.toBeInTheDocument();

    const toggle = screen.getByRole("button", {
      name: "Toggle expandable heading",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");
  });

  it("types expandable heading text and toggles the disclosure button", async () => {
    const { user } = renderEditor();

    const heading = await createExpandableHeading(user);
    await user.keyboard("Expandable title");

    expect(heading).toHaveTextContent("Expandable title");

    const toggle = screen.getByRole("button", {
      name: "Toggle expandable heading",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(heading).toHaveFocus();
  });

  it("creates a focused continuation paragraph when an expandable heading collapses", async () => {
    const { user } = renderEditor();

    const heading = await createExpandableHeading(user);
    await user.keyboard("Expandable title");
    expect(heading).toHaveTextContent("Expandable title");

    const toggle = screen.getByRole("button", {
      name: "Toggle expandable heading",
    });
    await user.click(toggle);

    const continuation = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(continuation).toHaveFocus();
  });

  it("creates paragraph body content after an expandable heading", async () => {
    const { user } = renderEditor();

    const heading = await createExpandableHeading(user);
    await user.keyboard("Expandable title");
    await user.keyboard("{Enter}");

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraph).toHaveFocus();

    await user.keyboard("Expandable body");
    expect(heading).toHaveTextContent("Expandable title");
    expect(paragraph).toHaveTextContent("Expandable body");
  });

  it("hides and restores expandable heading paragraph body content", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user, "/");
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");
    await user.keyboard("{Enter}");

    const heading = screen.getByRole("textbox", {
      name: "Expandable Heading 1 block",
    });
    await user.keyboard("Expandable title");
    await user.keyboard("{Enter}");

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.keyboard("Expandable body");
    expect(paragraph).toHaveTextContent("Expandable body");

    const toggle = screen.getByRole("button", {
      name: "Toggle expandable heading",
    });
    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(heading).toHaveTextContent("Expandable title");
    expect(screen.queryByText("Expandable body")).not.toBeInTheDocument();
    expect(
      screen.getByRole("textbox", { name: "Paragraph block" }),
    ).toHaveFocus();

    await user.click(toggle);

    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Expandable body")).toBeInTheDocument();
  });

  it("uses arrow navigation to select Expandable Heading 1 and Enter converts it", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user, "/");

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}");

    expect(within(menu).getByLabelText("Heading 1")).not.toHaveAttribute(
      "data-selected",
    );
    expect(within(menu).getByLabelText("Expandable Heading 1")).toHaveAttribute(
      "data-selected",
      "true",
    );

    await user.keyboard("{Enter}");

    expect(
      screen.getByRole("textbox", { name: "Expandable Heading 1 block" }),
    ).toHaveFocus();
  });

  it("supports repeated expandable heading usage", async () => {
    const { user } = renderEditor();

    const firstHeading = await createExpandableHeading(user);
    await user.keyboard("First expandable");

    const toggle = screen.getByRole("button", {
      name: "Toggle expandable heading",
    });
    await user.click(toggle);

    const continuation = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await typeSlashCommand(user, "/", continuation);
    await selectCommand(user, "Expandable Heading 1");

    const secondHeading = getEditableBlocks("Expandable Heading 1 block")[1];
    await user.keyboard("Second expandable");

    const expandableHeadings = getEditableBlocks("Expandable Heading 1 block");
    expect(expandableHeadings).toHaveLength(2);
    expect(firstHeading).toHaveTextContent("First expandable");
    expect(secondHeading).toHaveTextContent("Second expandable");
    expect(secondHeading).toHaveFocus();
  });
});
