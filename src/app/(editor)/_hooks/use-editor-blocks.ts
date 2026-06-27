"use client";

import { useCallback, useState } from "react";

import { INITIAL_BLOCK } from "../_constants/editor.constants";
import type {
  EditorBlock,
  HeadingBlockType,
  TextBlockType,
} from "../_types/editor.types";
import { createBlockId } from "../_utils/create-block-id";
import {
  clearSlashCommandText,
  convertBlockType,
  deleteBlock as deleteBlockFromBlocks,
  ensureTrailingParagraph as ensureTrailingParagraphInBlocks,
  findBlockById,
  insertParagraphAfter as insertParagraphAfterBlock,
  reorderBlocks as reorderEditorBlocks,
  toggleExpandableHeading as toggleExpandableHeadingInBlocks,
  turnBlockIntoType,
  updateBlockText as updateBlockTextInBlocks,
} from "../_utils/editor-block.utils";

export function useEditorBlocks() {
  const [blocks, setBlocks] = useState<EditorBlock[]>(() => [
    { ...INITIAL_BLOCK },
  ]);
  const [activeBlockId, setActiveBlockId] = useState(INITIAL_BLOCK.id);
  const activeBlock = findBlockById(blocks, activeBlockId);

  const setActiveBlock = useCallback((blockId: string) => {
    setActiveBlockId(blockId);
  }, []);

  const updateBlockText = useCallback((blockId: string, text: string) => {
    setActiveBlockId(blockId);
    setBlocks((currentBlocks) =>
      updateBlockTextInBlocks(currentBlocks, blockId, text),
    );
  }, []);

  const clearSlashCommand = useCallback((blockId: string) => {
    setBlocks((currentBlocks) =>
      clearSlashCommandText(currentBlocks, blockId),
    );
  }, []);

  const convertBlock = useCallback(
    (blockId: string, blockType: HeadingBlockType) => {
      setActiveBlockId(blockId);
      setBlocks((currentBlocks) =>
        convertBlockType(currentBlocks, blockId, blockType),
      );
    },
    [],
  );

  const toggleExpandableHeading = useCallback((blockId: string) => {
    const block = findBlockById(blocks, blockId);
    if (block?.type === "expandable-heading-1" && block.isExpanded) {
      const collapsedBlocks = toggleExpandableHeadingInBlocks(blocks, blockId);
      const result = insertParagraphAfterBlock(
        collapsedBlocks,
        blockId,
        createBlockId(),
      );
      const focusBlockId = result.paragraphId ?? blockId;

      setBlocks(result.blocks);
      setActiveBlockId(focusBlockId);
      return focusBlockId;
    }

    setBlocks((currentBlocks) =>
      toggleExpandableHeadingInBlocks(currentBlocks, blockId),
    );
    setActiveBlockId(blockId);
    return blockId;
  }, [blocks]);

  const turnBlockInto = useCallback(
    (blockId: string, blockType: TextBlockType) => {
      setActiveBlockId(blockId);
      setBlocks((currentBlocks) =>
        turnBlockIntoType(currentBlocks, blockId, blockType),
      );
    },
    [],
  );

  const deleteBlock = useCallback(
    (blockId: string) => {
      const result = deleteBlockFromBlocks(
        blocks,
        blockId,
        createBlockId(),
      );

      if (!result.focusBlockId) {
        return null;
      }

      setBlocks(result.blocks);
      setActiveBlockId(result.focusBlockId);
      return result.focusBlockId;
    },
    [blocks],
  );

  const insertParagraphAfter = useCallback(
    (blockId: string) => {
      const result = insertParagraphAfterBlock(
        blocks,
        blockId,
        createBlockId(),
      );

      if (!result.paragraphId) {
        return null;
      }

      setBlocks(result.blocks);
      setActiveBlockId(result.paragraphId);
      return result.paragraphId;
    },
    [blocks],
  );

  const ensureTrailingParagraph = useCallback(() => {
    const result = ensureTrailingParagraphInBlocks(blocks, createBlockId());

    if (!result.paragraphId) {
      return null;
    }

    setBlocks(result.blocks);
    setActiveBlockId(result.paragraphId);
    return result.paragraphId;
  }, [blocks]);

  const reorderBlocks = useCallback((activeBlockId: string, overBlockId: string) => {
    setActiveBlockId(activeBlockId);
    setBlocks((currentBlocks) =>
      reorderEditorBlocks(currentBlocks, activeBlockId, overBlockId),
    );
  }, []);

  return {
    activeBlock,
    activeBlockId,
    blocks,
    clearSlashCommand,
    convertBlock,
    deleteBlock,
    ensureTrailingParagraph,
    insertParagraphAfter,
    reorderBlocks,
    setActiveBlock,
    toggleExpandableHeading,
    turnBlockInto,
    updateBlockText,
  };
}
