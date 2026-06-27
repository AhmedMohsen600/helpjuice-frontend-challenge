import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";

import { HelpjuiceEditor } from "./helpjuice-editor";

async function openFilteredMenu() {
  const user = userEvent.setup();
  const paragraph = screen.getByRole("textbox", { name: "Paragraph block" });

  await user.click(paragraph);
  await user.keyboard("/1");

  return { user, paragraph };
}

async function convertToHeadingWithEnter() {
  const { user } = await openFilteredMenu();

  await user.keyboard("{Enter}");

  return {
    user,
    heading: screen.getByRole("textbox", { name: "Heading 1 block" }),
  };
}

describe("HelpjuiceEditor", () => {
  test("renders the initial editor state from the Figma flow", () => {
    render(<HelpjuiceEditor />);

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

  test("typing slash in the empty paragraph opens the add blocks menu", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

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
    expect(paragraph).toHaveTextContent("/");
  });

  test("clicking Paragraph / Text clears the slash and keeps focus in the paragraph", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");

    await user.click(screen.getByRole("menuitem", { name: "Paragraph / Text" }));

    expect(paragraph).toHaveFocus();
    expect(paragraph).toHaveTextContent("");
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  test("typing one keeps the menu open and shows the highlighted filtering keyword", async () => {
    render(<HelpjuiceEditor />);

    const { paragraph } = await openFilteredMenu();

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    expect(paragraph).toHaveTextContent("/1");
    expect(within(menu).getByText("Filtering keyword")).toBeInTheDocument();
    expect(screen.getByTestId("filter-keyword-highlight")).toHaveTextContent(
      "1",
    );
    expect(within(menu).getByLabelText("Heading 1")).toHaveAttribute(
      "data-selected",
      "true",
    );
    expect(
      within(menu).getByText("Shortcut: type # + space"),
    ).toBeInTheDocument();
    expect(
      within(menu).getByText("Shortcut: type >># + space"),
    ).toBeInTheDocument();
  });

  test("typing slash two filters to Heading 2 and Enter converts the block", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

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

  test("unsupported slash query closes the menu and Enter does not convert the block", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

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

  test("pasting into a focused paragraph updates through native contentEditable input", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.paste("Pasted paragraph text");

    expect(paragraph).toHaveTextContent("Pasted paragraph text");
  });

  test("native input replacement updates editor state without printable key interception", () => {
    render(<HelpjuiceEditor />);

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

  test("editing text in the middle through native input updates editor state", () => {
    render(<HelpjuiceEditor />);

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

  test("clicking Heading 1 converts the current block, removes slash filter, and keeps focus in the H1", async () => {
    render(<HelpjuiceEditor />);
    const { user } = await openFilteredMenu();

    await user.click(screen.getByLabelText("Heading 1"));

    const heading = screen.getByRole("textbox", { name: "Heading 1 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(heading).toHaveAttribute("data-placeholder", "Heading 1");
    expect(screen.queryByText("/1")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  test("clicking Expandable Heading 1 converts the current block and keeps focus", async () => {
    render(<HelpjuiceEditor />);
    const { user } = await openFilteredMenu();

    const menu = screen.getByRole("menu", { name: "Add blocks" });
    const expandableHeading = within(menu).getByRole("menuitem", {
      name: "Expandable Heading 1",
    });

    await user.click(expandableHeading);

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

  test("the empty paragraph shows an add block affordance", () => {
    render(<HelpjuiceEditor />);

    expect(
      screen.getByRole("button", { name: "Add block below" }),
    ).toBeInTheDocument();
  });

  test("drag handle menu turns a block into headings and paragraph", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

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

  test("drag handle menu deletes a block and focuses the next block", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

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

  test("Arrow navigation selects Expandable Heading 1 and Enter converts it", async () => {
    render(<HelpjuiceEditor />);
    const { user } = await openFilteredMenu();

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

  test("Arrow navigation wraps between slash menu commands", async () => {
    render(<HelpjuiceEditor />);
    const { user } = await openFilteredMenu();

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

  test("collapsing an expandable heading creates and focuses a continuation paragraph", async () => {
    render(<HelpjuiceEditor />);
    const { user } = await openFilteredMenu();

    await user.click(screen.getByLabelText("Expandable Heading 1"));

    const heading = screen.getByRole("textbox", {
      name: "Expandable Heading 1 block",
    });
    await user.keyboard("Expandable title");
    expect(heading).toHaveTextContent("Expandable title");

    const toggle = screen.getByRole("button", {
      name: "Toggle expandable heading",
    });
    expect(toggle).toHaveAttribute("aria-expanded", "true");

    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");

    const continuation = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    expect(continuation).toHaveFocus();
  });

  test("collapsing an expandable heading hides and restores its paragraph body", async () => {
    render(<HelpjuiceEditor />);
    const { user } = await openFilteredMenu();

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

  test("pressing Enter while Heading 1 is selected converts the current block", async () => {
    render(<HelpjuiceEditor />);

    const { user } = await openFilteredMenu();
    await user.keyboard("{Enter}");

    const heading = screen.getByRole("textbox", { name: "Heading 1 block" });
    expect(heading).toHaveFocus();
    expect(heading).toHaveTextContent("");
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  test("typing after conversion updates the focused H1", async () => {
    render(<HelpjuiceEditor />);

    const { user, heading } = await convertToHeadingWithEnter();
    await user.keyboard("This is my header");

    expect(heading).toHaveTextContent("This is my header");
  });

  test("pressing Enter after the H1 creates and focuses a normal paragraph below", async () => {
    render(<HelpjuiceEditor />);

    const { user, heading } = await convertToHeadingWithEnter();
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

  test("rapid repeated Enter on an empty paragraph keeps one continuation block", async () => {
    render(<HelpjuiceEditor />);

    const { user } = await convertToHeadingWithEnter();
    await user.keyboard("This is my header");
    await user.keyboard("{Enter}{Enter}{Enter}");

    const paragraphs = screen.getAllByRole("textbox", {
      name: "Paragraph block",
    });
    expect(paragraphs).toHaveLength(1);
    expect(paragraphs[0]).toHaveFocus();
  });

  test("pressing Enter after paragraph text creates and focuses the next paragraph", async () => {
    render(<HelpjuiceEditor />);

    const { user } = await convertToHeadingWithEnter();
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

  test("clicking blank editor space after paragraph text creates and focuses a trailing paragraph", async () => {
    render(<HelpjuiceEditor />);

    const { user } = await convertToHeadingWithEnter();
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

  test("shows a continuation affordance below non-empty content before creating the next paragraph", async () => {
    render(<HelpjuiceEditor />);

    const user = userEvent.setup();
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

  test("clicking blank editor space reuses an existing empty trailing paragraph", async () => {
    render(<HelpjuiceEditor />);

    const { user } = await convertToHeadingWithEnter();
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

  test("pressing Enter on the same H1 reuses the existing empty paragraph below", async () => {
    render(<HelpjuiceEditor />);

    const { user, heading } = await convertToHeadingWithEnter();
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

  test("pressing Enter on an H1 focuses the existing text paragraph below instead of inserting a blank one", async () => {
    render(<HelpjuiceEditor />);

    const { user, heading } = await convertToHeadingWithEnter();
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

  test("long heading and paragraph content remain editable", async () => {
    render(<HelpjuiceEditor />);

    const { user, heading } = await convertToHeadingWithEnter();
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

  test("Escape closes the slash menu", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

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

  test("clicking outside closes the slash menu", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");
    await user.click(screen.getByTestId("editor-shell"));

    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });

  test("removing the slash closes the menu", async () => {
    const user = userEvent.setup();
    render(<HelpjuiceEditor />);

    const paragraph = screen.getByRole("textbox", {
      name: "Paragraph block",
    });
    await user.click(paragraph);
    await user.keyboard("/");
    await user.keyboard("{Backspace}");

    expect(paragraph).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("menu", { name: "Add blocks" }),
    ).not.toBeInTheDocument();
  });
});
