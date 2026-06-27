import { afterEach, describe, expect, test, vi } from "vitest";

import type { EditorBlock } from "../_types/editor.types";
import { createBlockId } from "./create-block-id";
import {
  convertBlockType,
  deleteBlock,
  ensureTrailingParagraph,
  getVisibleBlocks,
  insertParagraphAfter,
  reorderBlocks,
  toggleExpandableHeading,
  turnBlockIntoType,
  updateBlockText,
} from "./editor-block.utils";

describe("editor block utilities", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test("converts a paragraph to an empty heading block", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "/1" },
    ];

    expect(convertBlockType(blocks, "paragraph", "heading-1")).toEqual([
      { id: "paragraph", type: "heading-1", text: "" },
    ]);
  });

  test("converts a paragraph slash command to an empty heading 3 block", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "/3" },
    ];

    expect(convertBlockType(blocks, "paragraph", "heading-3")).toEqual([
      { id: "paragraph", type: "heading-3", text: "" },
    ]);
  });

  test("turns an existing block into another text block type without losing text", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-2", text: "Keep my text" },
    ];

    expect(turnBlockIntoType(blocks, "heading", "paragraph")).toEqual([
      { id: "heading", type: "paragraph", text: "Keep my text" },
    ]);
  });

  test("deletes a block and returns the next block for focus", () => {
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

  test("deleting the only block leaves one empty paragraph focused", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "Only block" },
    ];

    expect(deleteBlock(blocks, "paragraph", "fallback")).toEqual({
      blocks: [{ id: "fallback", type: "paragraph", text: "" }],
      focusBlockId: "fallback",
    });
  });

  test("deleting an expandable heading removes its child blocks", () => {
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

  test("converts a paragraph to an expanded expandable heading block", () => {
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

  test("toggles only the requested expandable heading", () => {
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

  test("hides blocks parented to a collapsed expandable heading", () => {
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

  test("creates a child paragraph under an expanded expandable heading", () => {
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

  test("creates a sibling paragraph after a collapsed expandable heading group", () => {
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

  test("creates a visible trailing paragraph outside collapsed expandable children", () => {
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

  test("reuses the immediate empty paragraph after a heading", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "ahe" },
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(insertParagraphAfter(blocks, "heading", "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  test("reuses the immediate paragraph after a heading when it has text", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "ahe" },
      { id: "paragraph", type: "paragraph", text: "Existing text" },
    ];

    expect(insertParagraphAfter(blocks, "heading", "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  test("updates text without changing unrelated blocks", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(updateBlockText(blocks, "paragraph", "Body")).toEqual([
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "Body" },
    ]);
  });

  test("inserts a paragraph after another paragraph", () => {
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

  test("reuses an empty paragraph instead of inserting another empty paragraph", () => {
    const blocks: EditorBlock[] = [
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(insertParagraphAfter(blocks, "paragraph", "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  test("creates a trailing paragraph after the last non-empty block", () => {
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

  test("reuses an existing empty trailing paragraph", () => {
    const blocks: EditorBlock[] = [
      { id: "heading", type: "heading-1", text: "Heading" },
      { id: "paragraph", type: "paragraph", text: "" },
    ];

    expect(ensureTrailingParagraph(blocks, "new-paragraph")).toEqual({
      blocks,
      paragraphId: "paragraph",
    });
  });

  test("reorders blocks by moving the dragged block to the target block position", () => {
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

  test("returns the original block order when a drag target is invalid", () => {
    const blocks: EditorBlock[] = [
      { id: "first", type: "heading-1", text: "First" },
      { id: "second", type: "heading-1", text: "Second" },
    ];

    expect(reorderBlocks(blocks, "first", "missing")).toBe(blocks);
    expect(reorderBlocks(blocks, "first", "first")).toBe(blocks);
  });

  test("creates unique fallback block IDs when randomUUID is unavailable", () => {
    vi.stubGlobal("crypto", {});

    expect(createBlockId()).not.toBe(createBlockId());
  });
});
