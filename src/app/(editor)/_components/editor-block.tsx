import type { FormEvent, KeyboardEvent } from "react";
import { ChevronDown, ChevronRight, Menu, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

import { useEditorBlock } from "../_hooks/use-editor-block";
import type { EditorBlock as EditorBlockType } from "../_types/editor.types";
import type { SlashCommandId, TextBlockType } from "../_types/editor.types";
import { BlockActionMenu } from "./block-action-menu";
import { editorFocusRingClass, editorIconSize } from "./editor-style-utils";
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
  const {
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
    handleTurnInto,
    isBlockActionMenuOpen,
    isDragging,
    isExpandableHeading,
    isExpanded,
    isOver,
    menuAnchorElement,
    placeholder,
    setIsBlockActionMenuOpen,
    setMenuAnchorElement,
    showAddBlockButton,
  } = useEditorBlock({
    block,
    onDeleteBlock,
    onFocus,
    onInput,
    onKeyDown,
    onTurnInto,
    registerRef,
  });

  return (
    <div
      className={cn(
        "group relative before:absolute before:left-[-96px] before:top-0 before:h-full before:w-[96px] before:content-['']",
        isDragging && "opacity-80",
        isOver &&
          !isDragging &&
          "rounded-(--editor-radius-sm) bg-(--editor-surface-hover)",
      )}
      data-active={isActive ? "true" : undefined}
      data-editor-block-container
      key={block.id}
      ref={handleContainerRef}
      style={dragStyle}
    >
      {isExpandableHeading ? (
        <button
          aria-expanded={isExpanded}
          aria-label="Toggle expandable heading"
          className={cn(
            "absolute left-[-44px] top-1/2 z-10 flex h-[28px] w-[28px] -translate-y-1/2 items-center justify-center rounded-(--editor-radius-sm) text-(--editor-text-placeholder) transition-colors hover:bg-(--editor-surface-hover)",
            editorFocusRingClass,
          )}
          onClick={() => onToggleExpandable(block.id)}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          {isExpanded ? (
            <ChevronDown
              aria-hidden="true"
              className={editorIconSize.control}
            />
          ) : (
            <ChevronRight
              aria-hidden="true"
              className={editorIconSize.control}
            />
          )}
        </button>
      ) : null}
      {showAddBlockButton ? (
        <button
          aria-label="Add block below"
          className={cn(
            `absolute ${
              isExpandableHeading ? "left-[-118px]" : "left-[-76px]"
            } top-1/2 z-10 hidden h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-(--editor-radius-sm) text-(--editor-icon-muted) transition-colors hover:bg-(--editor-surface-hover) group-hover:flex focus-visible:flex`,
            editorFocusRingClass,
          )}
          onClick={() => onOpenAddBlockMenu(block.id)}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <Plus aria-hidden="true" className={editorIconSize.control} />
        </button>
      ) : null}
      <button
        aria-label={`Drag ${blockLabel}`}
        className={cn(
          `absolute ${
            isExpandableHeading ? "left-[-82px]" : "left-[-42px]"
          } top-1/2 z-10 flex h-[24px] w-[24px] -translate-y-1/2 cursor-grab items-center justify-center rounded-(--editor-radius-sm) transition-colors hover:bg-(--editor-surface-hover) active:cursor-grabbing`,
          editorFocusRingClass,
          dragHandleColorClass,
        )}
        data-drag-handle
        onClick={handleDragHandleClick}
        onMouseDown={handleDragHandleMouseDown}
        ref={handleDragHandleRef}
        type="button"
        {...dragAttributes}
        {...dragListeners}
      >
        <Menu
          aria-hidden="true"
          className={editorIconSize.drag}
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
        className={editableClassName}
        contentEditable
        data-editor-block
        data-placeholder={placeholder}
        onFocus={handleEditableFocus}
        onInput={handleEditableInput}
        onKeyDown={handleEditableKeyDown}
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
