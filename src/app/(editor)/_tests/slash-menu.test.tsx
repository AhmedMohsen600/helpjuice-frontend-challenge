import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  getEditor,
  renderEditor,
  selectCommand,
  typeSlashCommand,
} from "./test-utils";

describe("slash menu", () => {
  it("opens with / and renders the available commands", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    expect(within(menu).getByText("Add blocks")).toBeInTheDocument();
    expect(
      within(menu).getByText("Keep typing to filter, or escape to exit"),
    ).toBeInTheDocument();
    expect(within(menu).getByText("Paragraph / Text")).toBeInTheDocument();
    expect(within(menu).getByText("Heading 1")).toBeInTheDocument();
    expect(within(menu).getByText("Expandable Heading 1")).toBeInTheDocument();
    expect(within(menu).getByLabelText("Heading 1")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(menu).getByLabelText("Heading 2")).toHaveAttribute(
      "aria-checked",
      "false",
    );
    expect(paragraph).toHaveTextContent("/");
  });

  it("filters with /1 and shows only Heading 1", async () => {
    const { user } = renderEditor();

    const { block: paragraph, menu } = await typeSlashCommand(user);

    expect(paragraph).toHaveTextContent("/1");
    expect(within(menu).getByText("Filtering keyword")).toBeInTheDocument();
    expect(screen.getByTestId("filter-keyword-highlight")).toHaveTextContent(
      "1",
    );
    expect(within(menu).getByLabelText("Heading 1")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(1);
    expect(within(menu).queryByLabelText("Paragraph / Text")).not.toBeInTheDocument();
    expect(within(menu).queryByLabelText("Heading 2")).not.toBeInTheDocument();
    expect(
      within(menu).queryByLabelText("Expandable Heading 1"),
    ).not.toBeInTheDocument();
    expect(within(menu).getByText("Shortcut: type 1")).toBeInTheDocument();
  });

  it.each([
    ["/2", "2", "Heading 2", "Shortcut: type 2"],
    ["/3", "3", "Heading 3", "Shortcut: type 3"],
    ["/4", "4", "Heading 4", "Shortcut: type 4"],
    [
      "/5",
      "5",
      "Expandable Heading 1",
      "Shortcut: type 5",
    ],
  ])(
    "filters with %s and shows only %s",
    async (command, keyword, headingLabel, shortcutLabel) => {
      const { user } = renderEditor();

      const { menu } = await typeSlashCommand(user, command);

      expect(screen.getByTestId("filter-keyword-highlight")).toHaveTextContent(
        keyword,
      );
      expect(within(menu).getAllByRole("menuitemradio")).toHaveLength(1);
      expect(within(menu).getByLabelText(headingLabel)).toHaveAttribute(
        "aria-checked",
        "true",
      );
      expect(within(menu).getByText(shortcutLabel)).toBeInTheDocument();
    },
  );

  it("Arrow Down changes the selected command", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user, "/");

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowDown}");

    expect(within(menu).getByLabelText("Heading 1")).not.toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(menu).getByLabelText("Heading 2")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("Arrow Up changes the selected command", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user, "/");

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowUp}");

    expect(within(menu).getByLabelText("Paragraph / Text")).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(within(menu).getByLabelText("Heading 1")).not.toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("wraps keyboard navigation between slash menu commands", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user, "/");

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowUp}");

    expect(within(menu).getByLabelText("Paragraph / Text")).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await user.keyboard("{ArrowDown}");

    expect(within(menu).getByLabelText("Heading 1")).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("Enter selects the active command", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/2");

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    expect(paragraph).toHaveTextContent("/2");
    expect(screen.getByTestId("filter-keyword-highlight")).toHaveTextContent(
      "2",
    );
    expect(within(menu).getByLabelText("Heading 2")).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await user.keyboard("{Enter}");

    const heading = screen.getByRole("textbox", { name: "Heading 2 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(heading).toHaveAttribute("data-placeholder", "Heading 2");
  });

  it("Enter selects the expandable heading shortcut", async () => {
    const { user } = renderEditor();

    const { menu } = await typeSlashCommand(user, "/5");

    expect(within(menu).getByLabelText("Expandable Heading 1")).toHaveAttribute(
      "aria-checked",
      "true",
    );

    await user.keyboard("{Enter}");

    const heading = screen.getByRole("textbox", {
      name: "Expandable Heading 1 block",
    });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(heading).toHaveAttribute("data-placeholder", "Heading 1");
  });

  it("mouse click selects a command", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");

    await selectCommand(user, "Paragraph / Text");

    expect(paragraph).toHaveFocus();
    expect(paragraph).toHaveTextContent("");
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  it("turns unsupported slash text into paragraph text", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/description");

    expect(paragraph.textContent).toBe("description");
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Enter}");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("description");
    expect(paragraphs[1]).toHaveFocus();
  });

  it("Escape closes the menu", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");
    await user.keyboard("{Escape}");

    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  it("outside click closes the menu", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");
    await user.click(getEditor());

    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });
});
