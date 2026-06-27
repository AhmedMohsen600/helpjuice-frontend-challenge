import type {
  EditorBlock,
  HeadingBlockType,
  SlashCommandId,
  TextBlockType,
} from "../_types/editor.types";

export const EDITOR_DESCRIPTION =
  "Your goal is to make a page that looks exactly like this one, and has the ability to create H1 text simply by typing / then 1, then typing text, and hitting enter.";

export const PARAGRAPH_PLACEHOLDER =
  "Type / for blocks, @ to link docs or people";

export const HEADING_1_PLACEHOLDER = "Heading 1";
export const HEADING_2_PLACEHOLDER = "Heading 2";
export const HEADING_3_PLACEHOLDER = "Heading 3";
export const HEADING_4_PLACEHOLDER = "Heading 4";

export const HEADING_PLACEHOLDERS: Record<HeadingBlockType, string> = {
  "expandable-heading-1": HEADING_1_PLACEHOLDER,
  "heading-1": HEADING_1_PLACEHOLDER,
  "heading-2": HEADING_2_PLACEHOLDER,
  "heading-3": HEADING_3_PLACEHOLDER,
  "heading-4": HEADING_4_PLACEHOLDER,
};

export const INITIAL_BLOCK: EditorBlock = {
  id: "intro-block",
  type: "paragraph",
  text: "",
};

export const HEADING_1_COMMAND_ID = "heading-1";
export const HEADING_2_COMMAND_ID = "heading-2";
export const HEADING_3_COMMAND_ID = "heading-3";
export const HEADING_4_COMMAND_ID = "heading-4";
export const EXPANDABLE_HEADING_1_COMMAND_ID = "expandable-heading-1";
export const PARAGRAPH_COMMAND_ID = "paragraph";

export const SLASH_COMMAND_IDS = [
  PARAGRAPH_COMMAND_ID,
  HEADING_1_COMMAND_ID,
  HEADING_2_COMMAND_ID,
  HEADING_3_COMMAND_ID,
  HEADING_4_COMMAND_ID,
  EXPANDABLE_HEADING_1_COMMAND_ID,
] as const satisfies readonly SlashCommandId[];

export const SLASH_COMMANDS: ReadonlyArray<{
  filterKey?: string;
  id: SlashCommandId;
  label: string;
  shortcut: string;
}> = [
  {
    id: PARAGRAPH_COMMAND_ID,
    label: "Paragraph / Text",
    shortcut: "Shortcut: type plain text",
  },
  {
    filterKey: "1",
    id: HEADING_1_COMMAND_ID,
    label: "Heading 1",
    shortcut: "Shortcut: type 1",
  },
  {
    filterKey: "2",
    id: HEADING_2_COMMAND_ID,
    label: "Heading 2",
    shortcut: "Shortcut: type 2",
  },
  {
    filterKey: "3",
    id: HEADING_3_COMMAND_ID,
    label: "Heading 3",
    shortcut: "Shortcut: type 3",
  },
  {
    filterKey: "4",
    id: HEADING_4_COMMAND_ID,
    label: "Heading 4",
    shortcut: "Shortcut: type 4",
  },
  {
    filterKey: "5",
    id: EXPANDABLE_HEADING_1_COMMAND_ID,
    label: "Expandable Heading 1",
    shortcut: "Shortcut: type 5",
  },
];

export const BLOCK_TRANSFORM_OPTIONS: ReadonlyArray<{
  label: string;
  marker: string;
  type: TextBlockType;
}> = [
  { label: "Paragraph / Text", marker: "T", type: "paragraph" },
  { label: "Heading 1", marker: "H1", type: "heading-1" },
  { label: "Heading 2", marker: "H2", type: "heading-2" },
  { label: "Heading 3", marker: "H3", type: "heading-3" },
  { label: "Heading 4", marker: "H4", type: "heading-4" },
];

export const SLASH_MENU_HEIGHT = 471;
export const SLASH_MENU_SIDE_OFFSET = 10;
export const SLASH_MENU_VIEWPORT_GUTTER = 18;

export const EDITOR_BOTTOM_PADDING = 320;
export const EDITOR_MENU_OPEN_BOTTOM_PADDING = SLASH_MENU_HEIGHT + 48;
