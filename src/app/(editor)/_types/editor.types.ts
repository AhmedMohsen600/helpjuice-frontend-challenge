type EditorBlockBase = {
  id: string;
  parentId?: string;
  text: string;
};

export type ParagraphBlock = EditorBlockBase & {
  type: "paragraph";
};

export type Heading1Block = EditorBlockBase & {
  type: "heading-1";
};

export type Heading2Block = EditorBlockBase & {
  type: "heading-2";
};

export type Heading3Block = EditorBlockBase & {
  type: "heading-3";
};

export type Heading4Block = EditorBlockBase & {
  type: "heading-4";
};

export type ExpandableHeading1Block = EditorBlockBase & {
  type: "expandable-heading-1";
  isExpanded: boolean;
};

export type StaticHeadingBlock =
  | Heading1Block
  | Heading2Block
  | Heading3Block
  | Heading4Block;

export type EditorBlock =
  | ParagraphBlock
  | StaticHeadingBlock
  | ExpandableHeading1Block;

export type EditorBlockType = EditorBlock["type"];

export type TextBlockType = ParagraphBlock["type"] | StaticHeadingBlock["type"];

export type HeadingBlockType =
  | StaticHeadingBlock["type"]
  | ExpandableHeading1Block["type"];

export type SlashCommandId =
  | ParagraphBlock["type"]
  | HeadingBlockType;
