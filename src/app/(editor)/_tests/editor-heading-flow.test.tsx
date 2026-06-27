import { fireEvent, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
  createHeading,
  getEditableBlocks,
  getEditor,
  renderEditor,
  selectCommand,
  typeSlashCommand,
} from "./test-utils";

describe("editor heading flow", () => {
  it("focuses the initial paragraph in the Figma flow", () => {
    renderEditor();

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Front-end developer test project",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your goal is to make a page that looks exactly like this one, and has the ability to create H1 text simply by typing / then 1, then typing text, and hitting enter.",
      ),
    ).toBeInTheDocument();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraph).toHaveAttribute(
      "data-placeholder",
      "Type / for blocks, @ to link docs or people",
    );
    expect(paragraph).toHaveFocus();
  });

  it("converts /1 into a focused Heading 1 and clears the command text", async () => {
    const { user } = renderEditor();
    const { block: paragraph } = await typeSlashCommand(user);

    expect(paragraph).toHaveTextContent("/1");

    await selectCommand(user, "Heading 1");

    const heading = screen.getByRole("textbox", { name: "Heading 1 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(heading).toHaveAttribute("data-placeholder", "Heading 1");
    expect(screen.queryByText("/1")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  it("removing /1 closes the menu and leaves the paragraph empty", async () => {
    const { user } = renderEditor();
    const { block: paragraph } = await typeSlashCommand(user);

    await user.keyboard("{Backspace}{Backspace}");

    expect(paragraph).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  it("updates paragraph text from pasted content", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.paste("Pasted paragraph text");

    expect(paragraph).toHaveTextContent("Pasted paragraph text");
  });

  it("updates editor state when native input replaces text", () => {
    renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });

    paragraph.textContent = "/1";
    fireEvent.input(paragraph);

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    expect(paragraph).toHaveTextContent("/1");
    expect(within(menu).getByText("Filtering keyword")).toBeInTheDocument();
    expect(screen.getByTestId("filter-keyword-highlight")).toHaveTextContent(
      "1",
    );
  });

  it("updates text edited in the middle through native input", () => {
    renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });

    paragraph.textContent = "One brave paragraph";
    fireEvent.input(paragraph);
    expect(paragraph).toHaveTextContent("One brave paragraph");

    paragraph.textContent = "One edited paragraph";
    fireEvent.input(paragraph);
    expect(paragraph).toHaveTextContent("One edited paragraph");
  });

  it("shows an add block affordance for the empty paragraph", () => {
    renderEditor();

    expect(
      screen.getByRole("button", { name: "Add block below" }),
    ).toBeInTheDocument();
  });

  it("turns a block into headings and paragraph from the block action menu", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("Body text");

    await user.click(screen.getByRole("button", { name: "Drag Paragraph block" }));

    const menu = screen.getByRole("menu", { name: "Block actions" });
    expect(within(menu).getByText("Turn into")).toBeInTheDocument();

    await user.click(within(menu).getByRole("menuitem", { name: "Heading 3" }));

    const heading = screen.getByRole("textbox", { name: "Heading 3 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("Body text");

    await user.click(screen.getByRole("button", { name: "Drag Heading 3 block" }));
    await user.click(
      within(screen.getByRole("menu", { name: "Block actions" })).getByRole(
        "menuitem",
        { name: "Paragraph / Text" },
      ),
    );

    const convertedParagraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(convertedParagraph).toHaveFocus();
    expect(convertedParagraph).toHaveTextContent("Body text");
  });

  it("deletes a block from the block action menu and focuses the next block", async () => {
    const { user } = renderEditor();

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("First paragraph");
    await user.keyboard("{Enter}");
    await user.keyboard("Second paragraph");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(2);

    await user.click(
      screen.getAllByRole("button", { name: "Drag Paragraph block" })[0],
    );
    await user.click(
      within(screen.getByRole("menu", { name: "Block actions" })).getByRole(
        "menuitem",
        { name: "Delete" },
      ),
    );

    const remainingParagraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(remainingParagraph).toHaveTextContent("Second paragraph");
    expect(remainingParagraph).toHaveFocus();
    expect(screen.queryByText("First paragraph")).not.toBeInTheDocument();
  });

  it("pressing Enter while Heading 1 is selected converts the current block", async () => {
    const { user } = renderEditor();

    await typeSlashCommand(user);
    await user.keyboard("{Enter}");

    const heading = screen.getByRole("textbox", { name: "Heading 1 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  it("typing after conversion updates the focused H1", async () => {
    const { user } = renderEditor();

    const heading = await createHeading(user);
    await user.keyboard("This is my header");

    expect(heading).toHaveTextContent("This is my header");
  });

  it("pressing Enter after the H1 creates and focuses a normal paragraph below", async () => {
    const { user } = renderEditor();

    const heading = await createHeading(user);
    await user.keyboard("This is my header");
    await user.keyboard("{Enter}");

    expect(heading).toHaveTextContent("This is my header");
    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveFocus();

    await user.keyboard("Now this is normal text.");
    expect(paragraphs[0]).toHaveTextContent("Now this is normal text.");
  });

  it("keeps one continuation block after rapid repeated Enter on an empty paragraph", async () => {
    const { user } = renderEditor();

    await createHeading(user);
    await user.keyboard("This is my header");
    await user.keyboard("{Enter}{Enter}{Enter}");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveFocus();
  });

  it("creates and focuses the next paragraph after paragraph text", async () => {
    const { user } = renderEditor();

    await createHeading(user);
    await user.keyboard("This is my header");
    await user.keyboard("{Enter}");

    const firstParagraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.keyboard("First paragraph");
    await user.keyboard("{Enter}");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph");
    expect(paragraphs[1]).toHaveFocus();
    expect(firstParagraph).toHaveTextContent("First paragraph");
  });

  it("creates and focuses a trailing paragraph when blank editor space is clicked", async () => {
    const { user } = renderEditor();

    await createHeading(user);
    await user.keyboard("This is my header");
    await user.keyboard("{Enter}");

    const firstParagraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.keyboard("First paragraph");
    await user.click(screen.getByTestId("editor-continuation-surface"));

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph");
    expect(paragraphs[1]).toHaveFocus();
    expect(firstParagraph).toHaveTextContent("First paragraph");
  });

  it("shows a continuation affordance below non-empty content before creating the next paragraph", async () => {
    const { user } = renderEditor();
    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });

    await user.click(paragraph);
    await user.keyboard("First paragraph");

    const continuationHint = screen.getByRole("button", {
      name: "Continue editing below",
    });
    expect(continuationHint).toBeInTheDocument();

    await user.click(continuationHint);

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(2);
    expect(paragraphs[0]).toHaveTextContent("First paragraph");
    expect(paragraphs[1]).toHaveFocus();
  });

  it("reuses an existing empty trailing paragraph when blank editor space is clicked", async () => {
    const { user } = renderEditor();

    await createHeading(user);
    await user.keyboard("This is my header");
    await user.keyboard("{Enter}");

    const editorSurface = screen.getByTestId("editor-continuation-surface");
    await user.click(editorSurface);
    await user.click(editorSurface);

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveFocus();
  });

  it("reuses the existing empty paragraph below when Enter is pressed on the same H1", async () => {
    const { user } = renderEditor();

    const heading = await createHeading(user);
    await user.keyboard("ahe");
    await user.keyboard("{Enter}");

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraph).toHaveFocus();

    await user.click(heading);
    await user.keyboard("{Enter}");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveFocus();
  });

  it("focuses the existing text paragraph below an H1 instead of inserting a blank one", async () => {
    const { user } = renderEditor();

    const heading = await createHeading(user);
    await user.keyboard("eqwewq");
    await user.keyboard("{Enter}");

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.keyboard("eqwewqe");
    expect(paragraph).toHaveTextContent("eqwewqe");

    await user.click(heading);
    await user.keyboard("{Enter}");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveTextContent("eqwewqe");
    expect(paragraphs[0]).toHaveFocus();
  });

  it("keeps long heading and paragraph content editable", async () => {
    const { user } = renderEditor();

    const heading = await createHeading(user);
    const longHeading =
      "This is my header with enough extra words to wrap without losing focus";
    const longParagraph =
      "Now this is normal text with enough detail to exercise wrapping, native input, and the paragraph style after an H1 has been created.";

    await user.keyboard(longHeading);
    expect(heading).toHaveTextContent(longHeading);

    await user.keyboard("{Enter}");
    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraph).toHaveFocus();

    await user.keyboard(longParagraph);
    expect(paragraph).toHaveTextContent(longParagraph);
  });

  it("allows creating another heading after typing a paragraph", async () => {
    const { user } = renderEditor();

    const firstHeading = await createHeading(user);
    await user.keyboard("First heading");
    await user.keyboard("{Enter}");
    await user.keyboard("First paragraph");
    await user.keyboard("{Enter}");

    const trailingParagraph = getEditableBlocks("Paragraph block")[1];
    await typeSlashCommand(user, "/1", trailingParagraph);
    await user.keyboard("{Enter}");

    const headings = getEditableBlocks("Heading 1 block");
    expect(headings).toHaveLength(2);
    expect(firstHeading).toHaveTextContent("First heading");
    expect(headings[1]).toHaveFocus();
    expect(screen.getByText("First paragraph")).toBeInTheDocument();
  });

  it("supports repeated heading and paragraph creation", async () => {
    const { user } = renderEditor();

    const firstHeading = await createHeading(user);
    await user.keyboard("First heading");
    await user.keyboard("{Enter}");
    await user.keyboard("First body");
    await user.keyboard("{Enter}");

    const secondParagraph = getEditableBlocks("Paragraph block")[1];
    await typeSlashCommand(user, "/1", secondParagraph);
    await user.keyboard("{Enter}");

    const secondHeading = getEditableBlocks("Heading 1 block")[1];
    await user.keyboard("Second heading");
    await user.keyboard("{Enter}");
    await user.keyboard("Second body");

    const headings = getEditableBlocks("Heading 1 block");
    const paragraphs = getEditableBlocks("Paragraph block");
    expect(headings).toHaveLength(2);
    expect(paragraphs).toHaveLength(2);
    expect(firstHeading).toHaveTextContent("First heading");
    expect(secondHeading).toHaveTextContent("Second heading");
    expect(paragraphs[0]).toHaveTextContent("First body");
    expect(paragraphs[1]).toHaveTextContent("Second body");
  });

  it("keeps the editor surface available for continuation flows", () => {
    renderEditor();

    expect(getEditor()).toBeInTheDocument();
  });
});
