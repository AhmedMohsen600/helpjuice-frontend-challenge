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
      "data-selected",
      "true",
    );
    expect(paragraph).toHaveTextContent("/");
  });

  it("filters with /1 while keeping Heading 1 selected by default", async () => {
    const { user } = renderEditor();

    const { block: paragraph, menu } = await typeSlashCommand(user);

    expect(paragraph).toHaveTextContent("/1");
    expect(within(menu).getByText("Filtering keyword")).toBeInTheDocument();
    expect(screen.getByTestId("filter-keyword-highlight")).toHaveTextContent(
      "1",
    );
    expect(within(menu).getByLabelText("Heading 1")).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(within(menu).getByText("Shortcut: type # + space")).toBeInTheDocument();
    expect(
      within(menu).getByText("Shortcut: type >># + space"),
    ).toBeInTheDocument();
  });

  it("Arrow Down changes the selected command", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user);

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowDown}");

    expect(within(menu).getByLabelText("Heading 1")).not.toHaveAttribute(
      "data-selected",
    );
    expect(within(menu).getByLabelText("Heading 2")).toHaveAttribute(
      "data-selected",
      "true",
    );
  });

  it("Arrow Up changes the selected command", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user);

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowUp}");

    expect(within(menu).getByLabelText("Paragraph / Text")).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(within(menu).getByLabelText("Heading 1")).not.toHaveAttribute(
      "data-selected",
    );
  });

  it("wraps keyboard navigation between slash menu commands", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user);

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    await user.keyboard("{ArrowUp}");

    expect(within(menu).getByLabelText("Paragraph / Text")).toHaveAttribute(
      "data-selected",
      "true",
    );

    await user.keyboard("{ArrowDown}");

    expect(within(menu).getByLabelText("Heading 1")).toHaveAttribute(
      "data-selected",
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
      "data-selected",
      "true",
    );

    await user.keyboard("{Enter}");

    const heading = screen.getByRole("textbox", { name: "Heading 2 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(heading).toHaveAttribute("data-placeholder", "Heading 2");
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

  it("closes when the slash query is unsupported", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/x");

    expect(paragraph).toHaveTextContent("/x");
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();

    await user.keyboard("{Enter}");

    expect(
      screen.queryByRole("textbox", { name: "Heading 1 block" }),
    ).not.toBeInTheDocument();
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
