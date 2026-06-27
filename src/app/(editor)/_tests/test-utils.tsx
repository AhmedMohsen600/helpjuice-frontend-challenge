import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { HelpjuiceEditor } from "../_components/helpjuice-editor";

type TestUser = ReturnType<typeof userEvent.setup>;

export function renderEditor() {
  const user = userEvent.setup();
  render(<HelpjuiceEditor />);

  return { user };
}

export function getEditor() {
  return screen.getByTestId("editor-shell");
}

export function getEditableBlocks(name?: string | RegExp) {
  return name
    ? screen.getAllByRole("textbox", { name })
    : screen.getAllByRole("textbox");
}

export async function typeSlashCommand(
  user: TestUser,
  command = "/1",
  block = screen.getByRole("textbox", { name: "Paragraph block" }),
) {
  await user.click(block);
  await user.keyboard(command);

  return {
    block,
    menu: screen.getByRole("menu", { name: "Add blocks" }),
  };
}

export async function selectCommand(user: TestUser, commandName: string) {
  const menu = screen.getByRole("menu", { name: "Add blocks" });

  await user.click(within(menu).getByRole("menuitem", { name: commandName }));
}

export async function createHeading(user: TestUser) {
  await typeSlashCommand(user);
  await user.keyboard("{Enter}");

  return screen.getByRole("textbox", { name: "Heading 1 block" });
}

export async function createExpandableHeading(user: TestUser) {
  await typeSlashCommand(user, "/");
  await selectCommand(user, "Expandable Heading 1");

  return screen.getByRole("textbox", {
    name: "Expandable Heading 1 block",
  });
}
