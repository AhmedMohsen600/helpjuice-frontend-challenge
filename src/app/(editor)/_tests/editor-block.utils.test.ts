import { afterEach, describe, expect, it, vi } from "vitest";

import type { EditorBlock } from "../_types/editor.types";
import { createBlockId } from "../_utils/create-block-id";
import {
  clearSlashCommandText,
  convertBlockType,
  deleteBlock,
  ensureTrailingParagraph,
  getVisibleBlocks,
  insertParagraphAfter,
  reorderBlocks,
  toggleExpandableHeading,
  turnBlockIntoType,
  updateBlockText,
} from "../_utils/editor-block.utils";

describe("editor block utilities", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("updates text without changing unrelated blocks", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(updateBlockText(blocks, "paragraph", "Body")).toEqual([
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "Body" },
    ]);
  });

  it("clears slash command text from paragraph blocks", () => {
    const blocks: EditorBlock[] = [
      { id: "slash", type: "paragraph", text: "/1" },
      { id: "plain", type: "paragraph", text: "Body" },
      { id: "heading", type: "heading-1", text: "/1" },
    ];

    expect(clearSlashCommandText(blocks, "slash")).toEqual([
      { id: "slash", type: "paragraph", text: "" },
      { id: "plain", type: "paragraph", text: "Body" },
      { id: "heading", type: "heading-1", text: "/1" },
    ]);
  });

  it("leaves paragraph text unchanged when there is no slash command to clear", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "Body" },
    ];

    expect(clearSlashCommandText(blocks, "paragraph")).toEqual(blocks);
  });

  it("converts a paragraph to an empty heading block", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "/1" },
    ];

    expect(convertBlockType(blocks, "paragraph", "heading-1")).toEqual([
      { id: "paragraph", type: "heading-1", text: "" },
    ]);
  });

  it("converts a paragraph slash command to an empty heading 3 block", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "/3" },
    ];

    expect(convertBlockType(blocks, "paragraph", "heading-3")).toEqual([
      { id: "paragraph", type: "heading-3", text: "" },
    ]);
  });

  it("converts a paragraph to an expanded expandable heading block", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "/1" },
    ];

    expect(
      convertBlockType(blocks, "paragraph", "expandable-heading-1"),
    ).toEqual([
      {
        id: "paragraph",
        isExpanded: true,
        text: "",
        type: "expandable-heading-1",
      },
    ]);
  });

  it("turns an existing block into another text block type without losing text", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-2", text: "Keep my text" },
    ];

    expect(turnBlockIntoType(blocks, "heading", "paragraph")).toEqual([
      { id: "heading", type: "paragraph", text: "Keep my text" },
    ]);
  });

  it("inserts a paragraph after another paragraph", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "Body" },
    ];

    expect(insertParagraphAfter(blocks, "paragraph", "new-paragraph")).toEqual({
      blocks: [
        { id: "paragraph", type: "paragraph", text: "Body" },
        { id: "new-paragraph", type: "paragraph", text: "" },
      ],
      paragraphId: "new-paragraph",
    });
  });

  it("inserts a paragraph after a heading block", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
    ];

    expect(insertParagraphAfter(blocks, "heading", "new-paragraph")).toEqual({
      blocks: [
        { id: "heading", type: "heading-1", text: "Heading" },
        { id: "new-paragraph", type: "paragraph", text: "" },
      ],
      paragraphId: "new-paragraph",
    });
  });

  it("creates a child paragraph under an expanded expandable heading", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: true,
        text: "Expandable",
        type: "expandable-heading-1",
      },
    ];

    expect(insertParagraphAfter(blocks, "expandable", "new-paragraph")).toEqual(
      {
        blocks: [
          {
            id: "expandable",
            isExpanded: true,
            text: "Expandable",
            type: "expandable-heading-1",
          },
          {
            id: "new-paragraph",
            parentId: "expandable",
            text: "",
            type: "paragraph",
          },
        ],
        paragraphId: "new-paragraph",
      },
    );
  });

  it("creates a sibling paragraph after a collapsed expandable heading group", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child-paragraph",
        parentId: "expandable",
        text: "Hidden body",
        type: "paragraph",
      },
    ];

    expect(insertParagraphAfter(blocks, "expandable", "new-paragraph")).toEqual(
      {
        blocks: [
          {
            id: "expandable",
            isExpanded: false,
            text: "Expandable",
            type: "expandable-heading-1",
          },
          {
            id: "child-paragraph",
            parentId: "expandable",
            text: "Hidden body",
            type: "paragraph",
          },
          { id: "new-paragraph", text: "", type: "paragraph" },
        ],
        paragraphId: "new-paragraph",
      },
    );
  });

  it("reuses the immediate empty paragraph after a heading", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "ahe" },
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(insertParagraphAfter(blocks, "heading", "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  it("reuses the immediate paragraph after a heading when it has text", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "ahe" },
      { id: "paragraph", type: "paragraph", text: "Existing text" },
    ];

    expect(insertParagraphAfter(blocks, "heading", "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  it("reuses an empty paragraph instead of inserting another empty paragraph", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(insertParagraphAfter(blocks, "paragraph", "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  it("creates a trailing paragraph after the last non-empty block", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "Body" },
    ];

    expect(ensureTrailingParagraph(blocks, "new-paragraph")).toEqual({
      blocks: [
        { id: "heading", type: "heading-1", text: "Heading" },
        { id: "paragraph", type: "paragraph", text: "Body" },
        { id: "new-paragraph", type: "paragraph", text: "" },
      ],
      paragraphId: "new-paragraph",
    });
  });

  it("reuses an existing empty trailing paragraph", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(ensureTrailingParagraph(blocks, "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  it("creates a visible trailing paragraph outside collapsed expandable children", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child-paragraph",
        parentId: "expandable",
        text: "Hidden body",
        type: "paragraph",
      },
    ];

    expect(ensureTrailingParagraph(blocks, "new-paragraph")).toEqual({
      blocks: [
        {
          id: "expandable",
          isExpanded: false,
          text: "Expandable",
          type: "expandable-heading-1",
        },
        {
          id: "child-paragraph",
          parentId: "expandable",
          text: "Hidden body",
          type: "paragraph",
        },
        { id: "new-paragraph", text: "", type: "paragraph" },
      ],
      paragraphId: "new-paragraph",
    });
  });

  it("deletes a block and returns the next block for focus", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "Body" },
      { id: "next-heading", type: "heading-2", text: "Next" },
    ];

    expect(deleteBlock(blocks, "paragraph", "fallback")).toEqual({
      blocks: [
        { id: "heading", type: "heading-1", text: "Heading" },
        { id: "next-heading", type: "heading-2", text: "Next" },
      ],
      focusBlockId: "next-heading",
    });
  });

  it("deleting the only block leaves one empty paragraph focused", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "Only block" },
    ];

    expect(deleteBlock(blocks, "paragraph", "fallback")).toEqual({
      blocks: [{ id: "fallback", type: "paragraph", text: "" }],
      focusBlockId: "fallback",
    });
  });

  it("deleting an expandable heading removes its child blocks", () => {
    const blocks: EditorBlock[] = [
      { id: "before", type: "paragraph", text: "Before" },
      {
        id: "expandable",
        isExpanded: true,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child",
        parentId: "expandable",
        text: "Child",
        type: "paragraph",
      },
      { id: "after", type: "paragraph", text: "After" },
    ];

    expect(deleteBlock(blocks, "expandable", "fallback")).toEqual({
      blocks: [
        { id: "before", type: "paragraph", text: "Before" },
        { id: "after", type: "paragraph", text: "After" },
      ],
      focusBlockId: "after",
    });
  });

  it("toggles only the requested expandable heading", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: true,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      { id: "heading", type: "heading-1", text: "Heading" },
    ];

    expect(toggleExpandableHeading(blocks, "expandable")).toEqual([
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      { id: "heading", type: "heading-1", text: "Heading" },
    ]);
  });

  it("hides blocks parented to a collapsed expandable heading", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child-paragraph",
        parentId: "expandable",
        type: "paragraph",
        text: "Hidden body",
      },
      {
        id: "child-heading",
        parentId: "expandable",
        type: "heading-1",
        text: "Hidden child heading",
      },
      { id: "sibling-paragraph", type: "paragraph", text: "Visible sibling" },
      { id: "next-heading", type: "heading-1", text: "Next heading" },
      { id: "next-paragraph", type: "paragraph", text: "Visible body" },
    ];

    expect(getVisibleBlocks(blocks)).toEqual([
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      { id: "sibling-paragraph", type: "paragraph", text: "Visible sibling" },
      { id: "next-heading", type: "heading-1", text: "Next heading" },
      { id: "next-paragraph", type: "paragraph", text: "Visible body" },
    ]);
  });

  it("reorders blocks by moving the dragged block to the target block position", () => {
    const blocks: EditorBlock[] = [
      { id: "first", type: "heading-1", text: "First" },
      { id: "second", type: "heading-1", text: "Second" },
      { id: "third", type: "heading-1", text: "Third" },
    ];

    expect(reorderBlocks(blocks, "first", "third")).toEqual([
      { id: "second", type: "heading-1", text: "Second" },
      { id: "third", type: "heading-1", text: "Third" },
      { id: "first", type: "heading-1", text: "First" },
    ]);
  });

  it("reorders an expandable heading together with its child blocks", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: true,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child-paragraph",
        parentId: "expandable",
        text: "Child paragraph",
        type: "paragraph",
      },
      {
        id: "child-heading",
        parentId: "expandable",
        text: "Child heading",
        type: "heading-2",
      },
      { id: "after", type: "heading-1", text: "After" },
    ];

    expect(reorderBlocks(blocks, "expandable", "after")).toEqual([
      { id: "after", type: "heading-1", text: "After" },
      {
        id: "expandable",
        isExpanded: true,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child-paragraph",
        parentId: "expandable",
        text: "Child paragraph",
        type: "paragraph",
      },
      {
        id: "child-heading",
        parentId: "expandable",
        text: "Child heading",
        type: "heading-2",
      },
    ]);
  });

  it("keeps collapsed expandable children attached after a grouped reorder", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child",
        parentId: "expandable",
        text: "Hidden child",
        type: "paragraph",
      },
      { id: "after", type: "paragraph", text: "After" },
    ];
    const reordered = reorderBlocks(blocks, "expandable", "after");

    expect(reordered).toEqual([
      { id: "after", type: "paragraph", text: "After" },
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child",
        parentId: "expandable",
        text: "Hidden child",
        type: "paragraph",
      },
    ]);
    expect(getVisibleBlocks(reordered)).toEqual([
      { id: "after", type: "paragraph", text: "After" },
      {
        id: "expandable",
        isExpanded: false,
        text: "Expandable",
        type: "expandable-heading-1",
      },
    ]);
  });

  it("prevents child blocks from being dragged away from their expandable heading", () => {
    const blocks: EditorBlock[] = [
      {
        id: "expandable",
        isExpanded: true,
        text: "Expandable",
        type: "expandable-heading-1",
      },
      {
        id: "child",
        parentId: "expandable",
        text: "Child",
        type: "paragraph",
      },
      { id: "after", type: "paragraph", text: "After" },
    ];

    expect(reorderBlocks(blocks, "child", "after")).toBe(blocks);
    expect(reorderBlocks(blocks, "after", "child")).toBe(blocks);
  });

  it("returns the original block order when a drag target is invalid", () => {
    const blocks: EditorBlock[] = [
      { id: "first", type: "heading-1", text: "First" },
      { id: "second", type: "heading-1", text: "Second" },
    ];

    expect(reorderBlocks(blocks, "first", "missing")).toBe(blocks);
    expect(reorderBlocks(blocks, "first", "first")).toBe(blocks);
  });

  it("handles missing block IDs safely", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "Body" },
    ];

    expect(updateBlockText(blocks, "missing", "Updated")).toEqual(blocks);
    expect(clearSlashCommandText(blocks, "missing")).toEqual(blocks);
    expect(convertBlockType(blocks, "missing", "heading-1")).toEqual(blocks);
    expect(turnBlockIntoType(blocks, "missing", "heading-2")).toEqual(blocks);
    expect(insertParagraphAfter(blocks, "missing", "new-paragraph")).toEqual({
      blocks,
      paragraphId: null,
    });
    expect(deleteBlock(blocks, "missing", "fallback")).toEqual({
      blocks,
      focusBlockId: null,
    });
  });

  it("creates unique fallback block IDs when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});

    expect(createBlockId()).not.toBe(createBlockId());
  });
});
