"use client";

import { useCallback, useEffect, useState } from "react";

import {
  HEADING_1_COMMAND_ID,
  HEADING_2_COMMAND_ID,
  HEADING_3_COMMAND_ID,
  HEADING_4_COMMAND_ID,
  SLASH_COMMAND_IDS,
  SLASH_MENU_HEIGHT,
  SLASH_MENU_SIDE_OFFSET,
  SLASH_MENU_VIEWPORT_GUTTER,
} from "../_constants/editor.constants";
import type { EditorBlock, SlashCommandId } from "../_types/editor.types";

export function isSupportedSlashCommand(text: string) {
  return text === "/" || /^\/[1-4]$/.test(text);
}

function getSlashCommandQuery(text: string) {
  return isSupportedSlashCommand(text) ? text.slice(1) : "";
}

function getDefaultCommandId(query: string): SlashCommandId {
  if (query === "2") return HEADING_2_COMMAND_ID;
  if (query === "3") return HEADING_3_COMMAND_ID;
  if (query === "4") return HEADING_4_COMMAND_ID;
  return HEADING_1_COMMAND_ID;
}

type UseSlashMenuArgs = {
  activeBlock: EditorBlock | undefined;
  activeBlockId: string;
  getBlockElement: (blockId: string) => HTMLElement | undefined;
  onClose: (blockId: string) => void;
};

export function useSlashMenu({
  activeBlock,
  activeBlockId,
  getBlockElement,
  onClose,
}: UseSlashMenuArgs) {
  const [selectedCommandId, setSelectedCommandId] =
    useState<SlashCommandId>(HEADING_1_COMMAND_ID);
  const query =
    activeBlock?.type === "paragraph"
      ? getSlashCommandQuery(activeBlock.text)
      : "";
  const isOpen =
    activeBlock?.type === "paragraph" &&
    isSupportedSlashCommand(activeBlock.text);

  const resetSelection = useCallback((text = "/") => {
    setSelectedCommandId(getDefaultCommandId(getSlashCommandQuery(text)));
  }, []);

  const closeMenu = useCallback(() => {
    resetSelection();
    onClose(activeBlockId);
  }, [activeBlockId, onClose, resetSelection]);

  const moveSelection = useCallback((direction: "next" | "previous") => {
    setSelectedCommandId((currentCommandId) => {
      const currentIndex = SLASH_COMMAND_IDS.indexOf(currentCommandId);
      const offset = direction === "next" ? 1 : -1;
      const nextIndex =
        (currentIndex + offset + SLASH_COMMAND_IDS.length) %
        SLASH_COMMAND_IDS.length;

      return SLASH_COMMAND_IDS[nextIndex];
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const activeElement = getBlockElement(activeBlockId);
    if (activeElement) {
      const { bottom, height, top } = activeElement.getBoundingClientRect();
      const availableMenuHeight = Math.min(
        SLASH_MENU_HEIGHT,
        window.innerHeight - SLASH_MENU_VIEWPORT_GUTTER * 2,
      );
      const lowestBottomWithMenuBelow =
        window.innerHeight -
        availableMenuHeight -
        SLASH_MENU_SIDE_OFFSET -
        SLASH_MENU_VIEWPORT_GUTTER;
      const desiredTop = Math.max(
        SLASH_MENU_VIEWPORT_GUTTER,
        Math.min(window.innerHeight * 0.45, lowestBottomWithMenuBelow - height),
      );

      if (bottom > lowestBottomWithMenuBelow) {
        window.scrollTo({
          top: Math.max(0, window.scrollY + top - desiredTop),
        });
      }
    }

    function closeOnOutsidePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("[data-slash-menu]")) return;

      if (target.closest("[data-editor-block]")) return;

      closeMenu();
    }

    document.addEventListener("pointerdown", closeOnOutsidePointerDown);
    return () =>
      document.removeEventListener("pointerdown", closeOnOutsidePointerDown);
  }, [activeBlockId, closeMenu, getBlockElement, isOpen]);

  return {
    closeMenu,
    isOpen,
    moveSelection,
    query,
    resetSelection,
    selectedCommandId: isOpen ? selectedCommandId : null,
  };
}
