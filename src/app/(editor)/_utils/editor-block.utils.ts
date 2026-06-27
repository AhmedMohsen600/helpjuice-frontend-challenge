import type {
  EditorBlock,
  EditorBlockType,
  HeadingBlockType,
  TextBlockType,
} from "../_types/editor.types";

export type InsertParagraphAfterResult = {
  blocks: EditorBlock[];
  paragraphId: string | null;
};

export type DeleteBlockResult = {
  blocks: EditorBlock[];
  focusBlockId: string | null;
};

export function findBlockById(blocks: EditorBlock[], blockId: string) {
  return blocks.find((block) => block.id === blockId);
}

export function updateBlockText(
  blocks: EditorBlock[],
  blockId: string,
  text: string,
) {
  return blocks.map((block) =>
    block.id === blockId ? { ...block, text } : block,
  );
}

export function clearSlashCommandText(
  blocks: EditorBlock[],
  blockId: string,
) {
  return blocks.map((block) =>
    block.id === blockId &&
    block.type === "paragraph" &&
    block.text.startsWith("/")
      ? { ...block, text: "" }
      : block,
  );
}

export function convertBlockType(
  blocks: EditorBlock[],
  blockId: string,
  blockType: HeadingBlockType,
) {
  return blocks.map((block) =>
    block.id === blockId && block.type === "paragraph"
      ? createHeadingBlock(block, blockType)
      : block,
  );
}

export function turnBlockIntoType(
  blocks: EditorBlock[],
  blockId: string,
  blockType: TextBlockType,
) {
  return blocks.map((block) =>
    block.id === blockId ? createTextBlock(block, blockType, block.text) : block,
  );
}

export function deleteBlock(
  blocks: EditorBlock[],
  blockId: string,
  fallbackParagraphId: string,
): DeleteBlockResult {
  const blockIndex = blocks.findIndex((block) => block.id === blockId);
  if (blockIndex === -1) {
    return { blocks, focusBlockId: null };
  }

  const deletedBlockIds = getDeletedBlockIds(blocks, blockId);
  const nextFocusableBlock = blocks
    .slice(blockIndex + 1)
    .find((block) => !deletedBlockIds.has(block.id));
  const previousFocusableBlock = blocks
    .slice(0, blockIndex)
    .findLast((block) => !deletedBlockIds.has(block.id));
  const nextBlocks = blocks.filter((block) => !deletedBlockIds.has(block.id));

  if (nextBlocks.length === 0) {
    return {
      blocks: [{ id: fallbackParagraphId, type: "paragraph", text: "" }],
      focusBlockId: fallbackParagraphId,
    };
  }

  return {
    blocks: nextBlocks,
    focusBlockId:
      nextFocusableBlock?.id ?? previousFocusableBlock?.id ?? null,
  };
}

function getDeletedBlockIds(blocks: EditorBlock[], blockId: string) {
  const deletedBlockIds = new Set([blockId]);
  let didAddChild = true;

  while (didAddChild) {
    didAddChild = false;
    for (const block of blocks) {
      if (
        block.parentId &&
        deletedBlockIds.has(block.parentId) &&
        !deletedBlockIds.has(block.id)
      ) {
        deletedBlockIds.add(block.id);
        didAddChild = true;
      }
    }
  }

  return deletedBlockIds;
}

function createHeadingBlock(
  sourceBlock: EditorBlock,
  blockType: HeadingBlockType,
): EditorBlock {
  return createTextBlock(sourceBlock, blockType, "");
}

function createTextBlock(
  sourceBlock: EditorBlock,
  blockType: EditorBlockType,
  text: string,
): EditorBlock {
  const parentFields = sourceBlock.parentId
    ? { parentId: sourceBlock.parentId }
    : {};

  if (blockType === "paragraph") {
    return {
      id: sourceBlock.id,
      ...parentFields,
      text,
      type: "paragraph",
    };
  }

  if (blockType === "expandable-heading-1") {
    return {
      id: sourceBlock.id,
      isExpanded: true,
      ...parentFields,
      text,
      type: "expandable-heading-1",
    };
  }

  return {
    id: sourceBlock.id,
    ...parentFields,
    text,
    type: blockType,
  };
}

export function toggleExpandableHeading(
  blocks: EditorBlock[],
  blockId: string,
) {
  return blocks.map((block) =>
    block.id === blockId && block.type === "expandable-heading-1"
      ? { ...block, isExpanded: !block.isExpanded }
      : block,
  );
}

export function getVisibleBlocks(blocks: EditorBlock[]) {
  const collapsedExpandableHeadingIds = new Set(
    blocks
      .filter(
        (block) =>
          block.type === "expandable-heading-1" && !block.isExpanded,
      )
      .map((block) => block.id),
  );

  return blocks.filter(
    (block) =>
      !block.parentId || !collapsedExpandableHeadingIds.has(block.parentId),
  );
}

export function reorderBlocks(
  blocks: EditorBlock[],
  activeBlockId: string,
  overBlockId: string,
) {
  if (activeBlockId === overBlockId) {
    return blocks;
  }

  const activeBlock = findBlockById(blocks, activeBlockId);
  const overBlock = findBlockById(blocks, overBlockId);

  if (!activeBlock || !overBlock) {
    return blocks;
  }

  if (activeBlock.parentId || overBlock.parentId) {
    return blocks;
  }

  const reorderSegments = getTopLevelReorderSegments(blocks);
  const activeSegmentIndex = reorderSegments.findIndex(
    (segment) => segment.rootBlockId === activeBlockId,
  );
  const overSegmentIndex = reorderSegments.findIndex(
    (segment) => segment.rootBlockId === overBlockId,
  );

  if (activeSegmentIndex === -1 || overSegmentIndex === -1) {
    return blocks;
  }

  const nextSegments = [...reorderSegments];
  const [activeSegment] = nextSegments.splice(activeSegmentIndex, 1);
  nextSegments.splice(overSegmentIndex, 0, activeSegment);

  return nextSegments.flatMap((segment) => segment.blocks);
}

type ReorderSegment = {
  blocks: EditorBlock[];
  rootBlockId: string;
};

function getTopLevelReorderSegments(blocks: EditorBlock[]) {
  const segments: ReorderSegment[] = [];
  let blockIndex = 0;

  while (blockIndex < blocks.length) {
    const rootBlock = blocks[blockIndex];
    if (rootBlock.parentId) {
      segments.push({
        blocks: [rootBlock],
        rootBlockId: rootBlock.id,
      });
      blockIndex += 1;
      continue;
    }

    if (rootBlock.type !== "expandable-heading-1") {
      segments.push({
        blocks: [rootBlock],
        rootBlockId: rootBlock.id,
      });
      blockIndex += 1;
      continue;
    }

    let groupEndIndex = blockIndex + 1;
    while (blocks[groupEndIndex]?.parentId === rootBlock.id) {
      groupEndIndex += 1;
    }

    segments.push({
      blocks: blocks.slice(blockIndex, groupEndIndex),
      rootBlockId: rootBlock.id,
    });
    blockIndex = groupEndIndex;
  }

  return segments;
}

export function ensureTrailingParagraph(
  blocks: EditorBlock[],
  paragraphId: string,
): InsertParagraphAfterResult {
  const lastBlock = blocks.at(-1);
  if (!lastBlock) {
    return { blocks, paragraphId: null };
  }

  const hiddenParentId = getCollapsedParentId(blocks, lastBlock);
  if (hiddenParentId) {
    return insertSiblingParagraphAfterExpandableGroup(
      blocks,
      hiddenParentId,
      paragraphId,
    );
  }

  if (lastBlock.type === "paragraph" && lastBlock.text === "") {
    return { blocks, paragraphId: lastBlock.id };
  }

  return insertParagraphAfter(blocks, lastBlock.id, paragraphId);
}

export function insertParagraphAfter(
  blocks: EditorBlock[],
  blockId: string,
  paragraphId: string,
): InsertParagraphAfterResult {
  const blockIndex = blocks.findIndex((block) => block.id === blockId);
  if (blockIndex === -1) {
    return { blocks, paragraphId: null };
  }

  const sourceBlock = blocks[blockIndex];
  if (sourceBlock.type === "paragraph" && sourceBlock.text === "") {
    return { blocks, paragraphId: sourceBlock.id };
  }

  if (
    sourceBlock.type === "expandable-heading-1" &&
    !sourceBlock.isExpanded
  ) {
    return insertSiblingParagraphAfterExpandableGroup(
      blocks,
      sourceBlock.id,
      paragraphId,
    );
  }

  const parentId =
    sourceBlock.type === "expandable-heading-1"
      ? sourceBlock.id
      : sourceBlock.parentId;
  const nextBlock = blocks[blockIndex + 1];
  if (
    sourceBlock.type !== "paragraph" &&
    nextBlock?.type === "paragraph" &&
    nextBlock.parentId === parentId
  ) {
    return { blocks, paragraphId: nextBlock.id };
  }

  const paragraphBlock: EditorBlock = parentId
    ? { id: paragraphId, parentId, type: "paragraph", text: "" }
    : { id: paragraphId, type: "paragraph", text: "" };

  return {
    blocks: [
      ...blocks.slice(0, blockIndex + 1),
      paragraphBlock,
      ...blocks.slice(blockIndex + 1),
    ],
    paragraphId,
  };
}

function getCollapsedParentId(
  blocks: EditorBlock[],
  block: EditorBlock,
) {
  if (!block.parentId) {
    return null;
  }

  const parentBlock = findBlockById(blocks, block.parentId);
  return parentBlock?.type === "expandable-heading-1" &&
    !parentBlock.isExpanded
    ? parentBlock.id
    : null;
}

function insertSiblingParagraphAfterExpandableGroup(
  blocks: EditorBlock[],
  expandableHeadingId: string,
  paragraphId: string,
): InsertParagraphAfterResult {
  const expandableHeadingIndex = blocks.findIndex(
    (block) => block.id === expandableHeadingId,
  );
  if (expandableHeadingIndex === -1) {
    return { blocks, paragraphId: null };
  }

  let insertionIndex = expandableHeadingIndex + 1;
  while (blocks[insertionIndex]?.parentId === expandableHeadingId) {
    insertionIndex += 1;
  }

  const nextBlock = blocks[insertionIndex];
  if (
    nextBlock?.type === "paragraph" &&
    !nextBlock.parentId &&
    nextBlock.text === ""
  ) {
    return { blocks, paragraphId: nextBlock.id };
  }

  return {
    blocks: [
      ...blocks.slice(0, insertionIndex),
      { id: paragraphId, type: "paragraph", text: "" },
      ...blocks.slice(insertionIndex),
    ],
    paragraphId,
  };
}
