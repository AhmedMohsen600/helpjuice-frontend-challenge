"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useCallback } from "react";

import { PARAGRAPH_COMMAND_ID } from "../_constants/editor.constants";
import type {
  EditorBlock,
  HeadingBlockType,
  SlashCommandId,
  TextBlockType,
} from "../_types/editor.types";
import { useEditorBlocks } from "./use-editor-blocks";
import { useEditorFocus } from "./use-editor-focus";
import { isSupportedSlashCommand, useSlashMenu } from "./use-slash-menu";

function getParagraphTextFromUnsupportedSlashText(text: string) {
  if (text.length <= 1 || !text.startsWith("/") || isSupportedSlashCommand(text)) {
    return text;
  }

  return text.slice(1);
}

export function useHelpjuiceEditor() {
  const {
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
  } = useEditorBlocks();
  const {
    getBlockElement,
    normalizeEmptyBlockElement,
    registerBlockRef,
    requestBlockSync,
    requestFocus,
  } = useEditorFocus({ blocks });

  const closeSlashMenu = useCallback(
    (blockId: string) => {
      clearSlashCommand(blockId);
      requestBlockSync(blockId);
    },
    [clearSlashCommand, requestBlockSync],
  );

  const slashMenu = useSlashMenu({
    activeBlock,
    activeBlockId,
    getBlockElement,
    onClose: closeSlashMenu,
  });
  const {
    isOpen: isSlashMenuOpen,
    moveSelection: moveSlashMenuSelection,
    query: slashFilter,
    resetSelection: resetSlashMenuSelection,
    selectedCommandId,
  } = slashMenu;

  const convertToHeading = useCallback(
    (blockId: string, commandId: HeadingBlockType) => {
      convertBlock(blockId, commandId);
      requestBlockSync(blockId);
      requestFocus(blockId);
    },
    [convertBlock, requestBlockSync, requestFocus],
  );

  const applySlashCommand = useCallback(
    (blockId: string, commandId: SlashCommandId) => {
      if (commandId === PARAGRAPH_COMMAND_ID) {
        clearSlashCommand(blockId);
        requestBlockSync(blockId);
        requestFocus(blockId);
        return;
      }

      convertToHeading(blockId, commandId);
    },
    [clearSlashCommand, convertToHeading, requestBlockSync, requestFocus],
  );

  const selectCommand = useCallback(
    (commandId: SlashCommandId) => {
      if (
        !activeBlock ||
        activeBlock.type !== "paragraph" ||
        !isSupportedSlashCommand(activeBlock.text)
      ) {
        return;
      }

      applySlashCommand(activeBlock.id, commandId);
    },
    [activeBlock, applySlashCommand],
  );

  const toggleExpandableBlock = useCallback(
    (blockId: string) => {
      const focusBlockId = toggleExpandableHeading(blockId);
      requestFocus(focusBlockId);
    },
    [requestFocus, toggleExpandableHeading],
  );

  const turnBlockIntoTextType = useCallback(
    (blockId: string, blockType: TextBlockType) => {
      turnBlockInto(blockId, blockType);
      requestBlockSync(blockId);
      requestFocus(blockId);
    },
    [requestBlockSync, requestFocus, turnBlockInto],
  );

  const deleteTextBlock = useCallback(
    (blockId: string) => {
      const focusBlockId = deleteBlock(blockId);
      if (focusBlockId) {
        requestFocus(focusBlockId);
      }
    },
    [deleteBlock, requestFocus],
  );

  const openAddBlockMenu = useCallback(
    (blockId: string) => {
      updateBlockText(blockId, "/");
      resetSlashMenuSelection("/");
      requestBlockSync(blockId);
      requestFocus(blockId);
    },
    [
      requestBlockSync,
      requestFocus,
      resetSlashMenuSelection,
      updateBlockText,
    ],
  );

  const handleBlockInput = useCallback(
    (block: EditorBlock, event: FormEvent<HTMLElement>) => {
      normalizeEmptyBlockElement(event.currentTarget);
      const nextText = event.currentTarget.textContent ?? "";
      if (isSupportedSlashCommand(nextText)) {
        resetSlashMenuSelection(nextText);
        updateBlockText(block.id, nextText);
        return;
      }

      const paragraphText = getParagraphTextFromUnsupportedSlashText(nextText);
      if (paragraphText !== nextText) {
        updateBlockText(block.id, paragraphText);
        requestBlockSync(block.id);
        requestFocus(block.id);
        return;
      }

      updateBlockText(block.id, paragraphText);
    },
    [
      normalizeEmptyBlockElement,
      requestBlockSync,
      requestFocus,
      resetSlashMenuSelection,
      updateBlockText,
    ],
  );

  const handleBlockKeyDown = useCallback(
    (block: EditorBlock, event: KeyboardEvent<HTMLElement>) => {
      if (event.nativeEvent.isComposing) {
        return;
      }

      const currentText = event.currentTarget.textContent ?? block.text;

      if (event.key === "Escape" && currentText.startsWith("/")) {
        event.preventDefault();
        clearSlashCommand(block.id);
        requestBlockSync(block.id);
        requestFocus(block.id);
        return;
      }

      if (block.type === "paragraph" && isSlashMenuOpen) {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          moveSlashMenuSelection("next");
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          moveSlashMenuSelection("previous");
          return;
        }
      }

      if (event.key !== "Enter") {
        return;
      }

      if (block.type === "paragraph" && isSupportedSlashCommand(currentText)) {
        event.preventDefault();
        if (selectedCommandId) {
          applySlashCommand(block.id, selectedCommandId);
        }
        return;
      }

      if (block.type === "paragraph") {
        event.preventDefault();
        const paragraphId = insertParagraphAfter(block.id);
        if (paragraphId) {
          requestFocus(paragraphId);
        }
        return;
      }

      event.preventDefault();
      const paragraphId = insertParagraphAfter(block.id);
      if (paragraphId) {
        requestFocus(paragraphId);
      }
    },
    [
      clearSlashCommand,
      applySlashCommand,
      insertParagraphAfter,
      isSlashMenuOpen,
      moveSlashMenuSelection,
      requestBlockSync,
      requestFocus,
      selectedCommandId,
    ],
  );

  const continueEditingAtEnd = useCallback(() => {
    const paragraphId = ensureTrailingParagraph();
    if (paragraphId) {
      requestFocus(paragraphId);
    }
  }, [ensureTrailingParagraph, requestFocus]);

  return {
    activeBlockId,
    continueEditingAtEnd,
    blocks,
    deleteBlock: deleteTextBlock,
    handleBlockInput,
    handleBlockKeyDown,
    isSlashMenuOpen,
    openAddBlockMenu,
    registerBlockRef,
    reorderBlocks,
    selectCommand,
    selectedCommandId,
    setActiveBlockId: setActiveBlock,
    slashFilter,
    toggleExpandableBlock,
    turnBlockIntoTextType,
  };
}
