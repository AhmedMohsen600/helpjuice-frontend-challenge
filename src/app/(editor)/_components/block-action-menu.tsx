import { Check, Trash2 } from "lucide-react";

import { Popover, PopoverContent } from "@/components/ui/popover";

import { BLOCK_TRANSFORM_OPTIONS } from "../_constants/editor.constants";
import type { EditorBlockType, TextBlockType } from "../_types/editor.types";

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
        className="w-[236px] gap-0 rounded-[7px] border border-[#dfe4eb] bg-white p-[6px] text-[#1d2635] shadow-[0_18px_44px_rgba(15,23,42,0.18)] ring-0 outline-none"
        collisionPadding={18}
        data-block-action-menu
        initialFocus={false}
        positionMethod="fixed"
        role="menu"
        side="right"
        sideOffset={12}
      >
        <div className="px-[10px] pb-[6px] pt-[5px] text-[13px] font-semibold leading-none text-[#687384]">
          Turn into
        </div>
        <div className="space-y-[2px]">
          {BLOCK_TRANSFORM_OPTIONS.map((option) => {
            const isSelected = blockType === option.type;

            return (
              <button
                aria-label={option.label}
                className={`flex h-[38px] w-full items-center gap-[10px] rounded-[5px] px-[8px] text-left text-[15px] font-semibold outline-none ${
                  isSelected ? "bg-[#f1f3f6]" : "bg-white hover:bg-[#f7f8fa]"
                }`}
                data-selected={isSelected ? "true" : undefined}
                key={option.type}
                onClick={() => onTurnInto(option.type)}
                onMouseDown={(event) => event.preventDefault()}
                role="menuitem"
                type="button"
              >
                <span className="flex h-[22px] w-[32px] items-center justify-center text-[17px] font-medium text-[#687384]">
                  {option.marker}
                </span>
                <span className="min-w-0 flex-1 truncate">{option.label}</span>
                {isSelected ? (
                  <Check
                    aria-hidden="true"
                    className="h-[16px] w-[16px] text-[#1d2635]"
                    strokeWidth={2.8}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="my-[6px] h-px bg-[#edf1f5]" />
        <button
          aria-label="Delete"
          className="flex h-[38px] w-full items-center gap-[10px] rounded-[5px] bg-white px-[8px] text-left text-[15px] font-semibold outline-none hover:bg-[#f7f8fa]"
          onClick={onDelete}
          onMouseDown={(event) => event.preventDefault()}
          role="menuitem"
          type="button"
        >
          <span className="flex h-[22px] w-[32px] items-center justify-center text-[#687384]">
            <Trash2
              aria-hidden="true"
              className="h-[18px] w-[18px]"
              strokeWidth={2.2}
            />
          </span>
          <span className="min-w-0 flex-1 truncate">Delete</span>
          <span className="text-[13px] font-medium text-[#9aa3b1]">Del</span>
        </button>
      </PopoverContent>
    </Popover>
  );
}
