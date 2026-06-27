import type { CSSProperties, FormEvent, KeyboardEvent } from "react";
import { useCallback, useState } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { ChevronDown, ChevronRight, Menu, Plus } from "lucide-react";

import {
  HEADING_PLACEHOLDERS,
  PARAGRAPH_PLACEHOLDER,
} from "../_constants/editor.constants";
import type { EditorBlock as EditorBlockType } from "../_types/editor.types";
import type { SlashCommandId, TextBlockType } from "../_types/editor.types";
import { BlockActionMenu } from "./block-action-menu";
import { SlashMenu } from "./slash-menu";

type EditorBlockProps = {
  block: EditorBlockType;
  isActive: boolean;
  showSlashMenu: boolean;
  slashFilter: string;
  onDeleteBlock: (blockId: string) => void;
  onFocus: (blockId: string) => void;
  onOpenAddBlockMenu: (blockId: string) => void;
  onInput: (block: EditorBlockType, event: FormEvent<HTMLElement>) => void;
  onKeyDown: (
    block: EditorBlockType,
    event: KeyboardEvent<HTMLElement>,
  ) => void;
  onSelectCommand: (commandId: SlashCommandId) => void;
  onToggleExpandable: (blockId: string) => void;
  onTurnInto: (blockId: string, blockType: TextBlockType) => void;
  registerRef: (blockId: string, element: HTMLElement | null) => void;
  selectedCommandId: SlashCommandId | null;
};

const headingClasses: Partial<Record<EditorBlockType["type"], string>> = {
  "expandable-heading-1":
    "editor-block min-h-[62px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[10px] text-[40px] font-bold leading-tight text-[#1d2635] outline-none",
  "heading-1":
    "editor-block min-h-[62px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[10px] text-[40px] font-bold leading-tight text-[#1d2635] outline-none",
  "heading-2":
    "editor-block min-h-[54px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[8px] text-[34px] font-bold leading-tight text-[#1d2635] outline-none",
  "heading-3":
    "editor-block min-h-[46px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[6px] text-[28px] font-bold leading-tight text-[#1d2635] outline-none",
  "heading-4":
    "editor-block min-h-[40px] w-full cursor-text whitespace-pre-wrap wrap-break-words pt-[4px] text-[23px] font-bold leading-tight text-[#1d2635] outline-none",
};

function isHeadingBlock(block: EditorBlockType) {
  return block.type !== "paragraph";
}

function getBlockLabel(block: EditorBlockType) {
  if (block.type === "expandable-heading-1") {
    return "Expandable Heading 1 block";
  }

  if (block.type === "paragraph") {
    return "Paragraph block";
  }

  return `Heading ${block.type.at(-1)} block`;
}

export function EditorBlock({
  block,
  isActive,
  showSlashMenu,
  slashFilter,
  onDeleteBlock,
  onFocus,
  onOpenAddBlockMenu,
  onInput,
  onKeyDown,
  onSelectCommand,
  onToggleExpandable,
  onTurnInto,
  registerRef,
  selectedCommandId,
}: EditorBlockProps) {
  const [menuAnchorElement, setMenuAnchorElement] =
    useState<HTMLSpanElement | null>(null);
  const [blockMenuAnchorElement, setBlockMenuAnchorElement] =
    useState<HTMLButtonElement | null>(null);
  const [isBlockActionMenuOpen, setIsBlockActionMenuOpen] = useState(false);
  const {
    attributes: dragAttributes,
    isDragging,
    listeners: dragListeners,
    setActivatorNodeRef,
    setNodeRef: setDraggableNodeRef,
    transform,
  } = useDraggable({ id: block.id });
  const {
    isOver,
    setNodeRef: setDroppableNodeRef,
  } = useDroppable({ id: block.id });
  const isExpandableHeading = block.type === "expandable-heading-1";
  const isHeading = isHeadingBlock(block);
  const placeholder = isHeading
    ? HEADING_PLACEHOLDERS[block.type]
    : PARAGRAPH_PLACEHOLDER;
  const blockLabel = getBlockLabel(block);
  const showAddBlockButton = block.type === "paragraph" && block.text === "";
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
  const dragStyle: CSSProperties | undefined = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 30 : undefined,
      }
    : undefined;
  const dragHandleColorClass =
    isHeading && !isExpandableHeading && block.text
      ? "text-[#d7dde6]"
      : "text-transparent focus-visible:text-[#d7dde6] group-hover:text-[#d7dde6]";

  return (
    <div
      className={`group relative before:absolute before:left-[-96px] before:top-0 before:h-full before:w-[96px] before:content-[''] ${
        isDragging ? "opacity-80" : ""
      } ${isOver && !isDragging ? "rounded-[4px] bg-[#f7f8fa]" : ""}`}
      data-active={isActive ? "true" : undefined}
      data-editor-block-container
      key={block.id}
      ref={handleContainerRef}
      style={dragStyle}
    >
      {isExpandableHeading ? (
        <button
          aria-expanded={block.isExpanded}
          aria-label="Toggle expandable heading"
          className="absolute left-[-44px] top-1/2 z-10 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-[4px] text-[#c7cfda] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
          onClick={() => onToggleExpandable(block.id)}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          {block.isExpanded ? (
            <ChevronDown aria-hidden="true" className="h-[22px] w-[22px]" />
          ) : (
            <ChevronRight aria-hidden="true" className="h-[22px] w-[22px]" />
          )}
        </button>
      ) : null}
      {showAddBlockButton ? (
        <button
          aria-label="Add block below"
          className={`absolute ${
            isExpandableHeading ? "left-[-118px]" : "left-[-76px]"
          } top-1/2 z-10 hidden h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] text-[#a4adbb] outline-none group-hover:flex focus-visible:flex focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40`}
          onClick={() => onOpenAddBlockMenu(block.id)}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <Plus aria-hidden="true" className="h-[22px] w-[22px]" />
        </button>
      ) : null}
      <button
        aria-label={`Drag ${blockLabel}`}
        className={`absolute ${
          isExpandableHeading ? "left-[-82px]" : "left-[-42px]"
        } ${
          isHeading ? "top-1/2 -translate-y-1/2" : "top-1/2 -translate-y-1/2"
        } z-10 flex h-[24px] w-[24px] cursor-grab items-center justify-center rounded-[4px] outline-none transition-colors active:cursor-grabbing focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40 ${dragHandleColorClass}`}
        data-drag-handle
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setIsBlockActionMenuOpen((isOpen) => !isOpen);
        }}
        onMouseDown={(event) => event.currentTarget.focus()}
        ref={handleDragHandleRef}
        type="button"
        {...dragAttributes}
        {...dragListeners}
      >
        <Menu
          aria-hidden="true"
          className="h-[24px] w-[24px]"
          strokeWidth={2.6}
        />
      </button>
      {blockMenuAnchorElement ? (
        <BlockActionMenu
          anchorElement={blockMenuAnchorElement}
          blockType={block.type}
          onDelete={handleDeleteBlock}
          onOpenChange={setIsBlockActionMenuOpen}
          onTurnInto={handleTurnInto}
          open={isBlockActionMenuOpen}
        />
      ) : null}
      <div
        aria-label={blockLabel}
        className={
          isHeading
            ? headingClasses[block.type]
            : "editor-block min-h-[32px] w-full cursor-text whitespace-pre-wrap wrap-break-words text-[19px] font-normal leading-[1.48] text-[#4b5565] outline-none"
        }
        contentEditable
        data-editor-block
        data-placeholder={placeholder}
        onFocus={() => onFocus(block.id)}
        onInput={(event) => onInput(block, event)}
        onKeyDown={(event) => onKeyDown(block, event)}
        ref={handleBlockRef}
        role="textbox"
        suppressContentEditableWarning
        suppressHydrationWarning
        tabIndex={0}
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-0 top-full h-px w-px opacity-0"
        ref={setMenuAnchorElement}
      />
      {showSlashMenu && menuAnchorElement ? (
        <SlashMenu
          anchorElement={menuAnchorElement}
          filter={slashFilter}
          onSelectCommand={onSelectCommand}
          selectedCommandId={selectedCommandId}
        />
      ) : null}
    </div>
  );
}
