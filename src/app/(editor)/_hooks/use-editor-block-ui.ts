import type {
  ClipboardEvent,
  CSSProperties,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
} from "react";
import { useCallback, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";

import {
  HEADING_PLACEHOLDERS,
  PARAGRAPH_PLACEHOLDER,
} from "../_constants/editor.constants";
import type { EditorBlock, TextBlockType } from "../_types/editor.types";

type UseEditorBlockUiArgs = {
  block: EditorBlock;
  onDeleteBlock: (blockId: string) => void;
  onFocus: (blockId: string) => void;
  onInput: (block: EditorBlock, event: FormEvent<HTMLElement>) => void;
  onKeyDown: (block: EditorBlock, event: KeyboardEvent<HTMLElement>) => void;
  onPaste: (block: EditorBlock, event: ClipboardEvent<HTMLElement>) => void;
  onTurnInto: (blockId: string, blockType: TextBlockType) => void;
  registerRef: (blockId: string, element: HTMLElement | null) => void;
};

const headingClasses: Partial<Record<EditorBlock["type"], string>> = {
  "expandable-heading-1":
    "editor-block min-h-[62px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[10px] text-[40px] font-bold leading-tight text-[var(--editor-text-heading)] outline-none",
  "heading-1":
    "editor-block min-h-[62px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[10px] text-[40px] font-bold leading-tight text-[var(--editor-text-heading)] outline-none",
  "heading-2":
    "editor-block min-h-[54px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[8px] text-[34px] font-bold leading-tight text-[var(--editor-text-heading)] outline-none",
  "heading-3":
    "editor-block min-h-[46px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[6px] text-[28px] font-bold leading-tight text-[var(--editor-text-heading)] outline-none",
  "heading-4":
    "editor-block min-h-[40px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[4px] text-[23px] font-bold leading-tight text-[var(--editor-text-heading)] outline-none",
};

function isHeadingBlock(block: EditorBlock) {
  return block.type !== "paragraph";
}

function getBlockLabel(block: EditorBlock) {
  if (block.type === "expandable-heading-1")
    return "Expandable Heading 1 block";

  if (block.type === "paragraph") return "Paragraph block";

  return `Heading ${block.type.at(-1)} block`;
}

export function useEditorBlockUi({
  block,
  onDeleteBlock,
  onFocus,
  onInput,
  onKeyDown,
  onPaste,
  onTurnInto,
  registerRef,
}: UseEditorBlockUiArgs) {
  const [menuAnchorElement, setMenuAnchorElement] =
    useState<HTMLSpanElement | null>(null);
  const [blockMenuAnchorElement, setBlockMenuAnchorElement] =
    useState<HTMLButtonElement | null>(null);
  const [isBlockActionMenuOpen, setIsBlockActionMenuOpen] = useState(false);
  const isExpandableChild = Boolean(block.parentId);
  const {
    attributes: dragAttributes,
    isDragging,
    listeners: dragListeners,
    setActivatorNodeRef,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({ disabled: isExpandableChild, id: block.id });
  const { isOver, setNodeRef: setDroppableNodeRef } = useDroppable({
    disabled: isExpandableChild,
    id: block.id,
  });
  const isExpandableHeading = block.type === "expandable-heading-1";
  const isExpanded = isExpandableHeading ? block.isExpanded : false;
  const isHeading = isHeadingBlock(block);
  const blockLabel = getBlockLabel(block);
  const placeholder = isHeading
    ? HEADING_PLACEHOLDERS[block.type]
    : PARAGRAPH_PLACEHOLDER;
  const editableClassName = isHeading
    ? headingClasses[block.type]
    : "editor-block min-h-[32px] w-full cursor-text whitespace-pre-wrap wrap-break-words text-[19px] font-normal leading-[1.48] text-[var(--editor-text-secondary)] outline-none";
  const showAddBlockButton = block.type === "paragraph" && block.text === "";
  const dragStyle: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 30 : undefined,
      }
    : undefined;
  const dragHandleColorClass =
    isHeading && !isExpandableHeading && block.text
      ? "text-[var(--editor-icon-faint)]"
      : "text-transparent focus-visible:text-[var(--editor-icon-faint)] group-hover:text-[var(--editor-icon-faint)]";

  const handleBlockRef = useCallback(
    (element: HTMLElement | null) => {
      registerRef(block.id, element);
    },
    [block.id, registerRef],
  );
  const handleContainerRef = useCallback(
    (element: HTMLDivElement | null) => {
      setDraggableNodeRef(element);
      setDroppableNodeRef(element);
    },
    [setDraggableNodeRef, setDroppableNodeRef],
  );
  const handleDragHandleRef = useCallback(
    (element: HTMLButtonElement | null) => {
      setActivatorNodeRef(element);
      setBlockMenuAnchorElement(element);
    },
    [setActivatorNodeRef],
  );
  const handleDragHandleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsBlockActionMenuOpen((isOpen) => !isOpen);
    },
    [],
  );
  const handleDragHandleMouseDown = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.currentTarget.focus();
    },
    [],
  );
  const handleEditableFocus = useCallback(() => {
    onFocus(block.id);
  }, [block.id, onFocus]);
  const handleEditableInput = useCallback(
    (event: FormEvent<HTMLElement>) => {
      onInput(block, event);
    },
    [block, onInput],
  );
  const handleEditableKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      onKeyDown(block, event);
    },
    [block, onKeyDown],
  );
  const handleEditablePaste = useCallback(
    (event: ClipboardEvent<HTMLElement>) => {
      onPaste(block, event);
    },
    [block, onPaste],
  );
  const handleTurnInto = useCallback(
    (blockType: TextBlockType) => {
      setIsBlockActionMenuOpen(false);
      onTurnInto(block.id, blockType);
    },
    [block.id, onTurnInto],
  );
  const handleDeleteBlock = useCallback(() => {
    setIsBlockActionMenuOpen(false);
    onDeleteBlock(block.id);
  }, [block.id, onDeleteBlock]);

  return {
    blockLabel,
    blockMenuAnchorElement,
    dragAttributes,
    dragHandleColorClass,
    dragListeners,
    dragStyle,
    editableClassName,
    handleBlockRef,
    handleContainerRef,
    handleDeleteBlock,
    handleDragHandleClick,
    handleDragHandleMouseDown,
    handleDragHandleRef,
    handleEditableFocus,
    handleEditableInput,
    handleEditableKeyDown,
    handleEditablePaste,
    handleTurnInto,
    isBlockActionMenuOpen,
    isDragging,
    isExpandableHeading,
    isExpanded,
    isOver,
    menuAnchorElement,
    placeholder,
    setBlockMenuAnchorElement,
    setIsBlockActionMenuOpen,
    setMenuAnchorElement,
    showAddBlockButton,
  };
}
