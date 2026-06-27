"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";

import { INITIAL_BLOCK } from "../_constants/editor.constants";
import type { EditorBlock } from "../_types/editor.types";
import { setCaretToEnd } from "../_utils/caret";
import { findBlockById } from "../_utils/editor-block.utils";

type UseEditorFocusArgs = {
  blocks: EditorBlock[];
};

function syncBlockElement(element: HTMLElement, block: EditorBlock) {
  if (block.text === "" && element.childNodes.length > 0) {
    element.replaceChildren();
    return;
  }

  if (element.textContent !== block.text) {
    element.textContent = block.text;
  }
}

export function useEditorFocus({ blocks }: UseEditorFocusArgs) {
  const blockRefs = useRef(new Map<string, HTMLElement>());
  const pendingFocusBlockId = useRef<string | null>(null);
  const pendingSyncBlockIds = useRef(new Set<string>());

  const registerBlockRef = useCallback(
    (blockId: string, element: HTMLElement | null) => {
      if (!element) {
        blockRefs.current.delete(blockId);
        return;
      }

      blockRefs.current.set(blockId, element);
      const block = findBlockById(blocks, blockId);
      if (block) {
        syncBlockElement(element, block);
      }
    },
    [blocks],
  );

  const getBlockElement = useCallback((blockId: string) => {
    return blockRefs.current.get(blockId);
  }, []);

  const normalizeEmptyBlockElement = useCallback((element: HTMLElement) => {
    if (element.textContent === "" && element.childNodes.length > 0) {
      element.replaceChildren();
    }
  }, []);

  const requestBlockSync = useCallback((blockId: string) => {
    pendingSyncBlockIds.current.add(blockId);
  }, []);

  const requestFocus = useCallback((blockId: string) => {
    pendingFocusBlockId.current = blockId;
  }, []);

  useEffect(() => {
    const element = blockRefs.current.get(INITIAL_BLOCK.id);
    if (element) {
      setCaretToEnd(element);
    }
  }, []);

  useLayoutEffect(() => {
    for (const blockId of pendingSyncBlockIds.current) {
      const block = findBlockById(blocks, blockId);
      const element = blockRefs.current.get(blockId);
      if (block && element) {
        syncBlockElement(element, block);
      }
    }
    pendingSyncBlockIds.current.clear();

    const focusBlockId = pendingFocusBlockId.current;
    if (!focusBlockId) {
      return;
    }

    const element = blockRefs.current.get(focusBlockId);
    if (element) {
      setCaretToEnd(element);
    }
    pendingFocusBlockId.current = null;
  });

  return {
    getBlockElement,
    normalizeEmptyBlockElement,
    registerBlockRef,
    requestBlockSync,
    requestFocus,
  };
}
