import { Check, Trash2 } from "lucide-react";

import { Popover, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { BLOCK_TRANSFORM_OPTIONS } from "../_constants/editor.constants";
import type { EditorBlockType, TextBlockType } from "../_types/editor.types";
import { editorFocusRingClass, editorIconSize } from "./editor-style-utils";

type BlockActionMenuProps = {
  anchorElement: HTMLElement;
  blockType: EditorBlockType;
  onDelete: () => void;
  onOpenChange: (open: boolean) => void;
  onTurnInto: (blockType: TextBlockType) => void;
  open: boolean;
};

export function BlockActionMenu({
  anchorElement,
  blockType,
  onDelete,
  onOpenChange,
  onTurnInto,
  open,
}: BlockActionMenuProps) {
  return (
    <Popover onOpenChange={onOpenChange} open={open}>
      <PopoverContent
        align="start"
        anchor={anchorElement}
        aria-label="Block actions"
        className="max-h-[calc(100vh-32px)] w-[min(236px,calc(100vw-32px))] gap-0 overflow-y-auto rounded-[var(--editor-radius-lg)] border border-[color:var(--editor-border)] bg-[var(--editor-surface)] p-[6px] text-[var(--editor-text-heading)] shadow-[var(--editor-shadow-action-menu)] ring-0 outline-none"
        collisionAvoidance={{
          side: "flip",
          align: "shift",
        }}
        collisionPadding={18}
        data-block-action-menu
        initialFocus={false}
        positionMethod="fixed"
        role="menu"
        side="right"
        sideOffset={12}
      >
        <div className="px-[10px] pb-[6px] pt-[5px] text-[13px] font-semibold leading-none text-[var(--editor-text-subtle)]">
          Turn into
        </div>
        <div className="space-y-[2px]">
          {BLOCK_TRANSFORM_OPTIONS.map((option) => {
            const isSelected = blockType === option.type;

            return (
              <button
                aria-label={option.label}
                className={cn(
                  "flex h-[38px] w-full items-center gap-[10px] rounded-[var(--editor-radius-md)] bg-[var(--editor-surface)] px-[8px] text-left text-[15px] font-semibold transition-colors hover:bg-[var(--editor-surface-hover)]",
                  editorFocusRingClass,
                  isSelected &&
                    "bg-[var(--editor-surface-selected)] hover:bg-[var(--editor-surface-selected)]",
                )}
                data-selected={isSelected ? "true" : undefined}
                key={option.type}
                onClick={() => onTurnInto(option.type)}
                onMouseDown={(event) => event.preventDefault()}
                role="menuitem"
                type="button"
              >
                <span className="flex h-[22px] w-[32px] items-center justify-center text-[17px] font-medium text-[var(--editor-text-subtle)]">
                  {option.marker}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    className="h-[16px] w-[16px] text-[var(--editor-text-heading)]"
                    strokeWidth={2.8}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="my-[6px] h-px bg-[var(--editor-divider)]" />
        <button
          aria-label="Delete"
          className={cn(
            "flex h-[38px] w-full items-center gap-[10px] rounded-[var(--editor-radius-md)] bg-[var(--editor-surface)] px-[8px] text-left text-[15px] font-semibold transition-colors hover:bg-[var(--editor-surface-hover)]",
            editorFocusRingClass,
          )}
          onClick={onDelete}
          onMouseDown={(event) => event.preventDefault()}
          role="menuitem"
          type="button"
        >
          <span className="flex h-[22px] w-[32px] items-center justify-center text-[var(--editor-text-subtle)]">
            <Trash2
              aria-hidden="true"
              className={editorIconSize.inline}
              strokeWidth={2.2}
            />
          </span>
          <span className="min-w-0 flex-1 truncate">Delete</span>
          <span className="text-[13px] font-medium text-[var(--editor-text-muted)]">
            Del
          </span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
