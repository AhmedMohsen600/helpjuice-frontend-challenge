import { Type } from "lucide-react";

import { Popover, PopoverContent } from "@/components/ui/popover";

import { SLASH_COMMANDS } from "../_constants/editor.constants";
import type { SlashCommandId } from "../_types/editor.types";

type SlashMenuProps = {
  anchorElement: HTMLElement;
  filter: string;
  onSelectCommand: (commandId: SlashCommandId) => void;
  selectedCommandId: SlashCommandId | null;
};

export function SlashMenu({
  anchorElement,
  filter,
  onSelectCommand,
  selectedCommandId,
}: SlashMenuProps) {
  return (
    <Popover open>
      <PopoverContent
        align="start"
        anchor={anchorElement}
        aria-label="Add blocks"
        className="h-[471px] max-h-[calc(100vh-36px)] w-[calc(100vw-36px)] gap-0 overflow-y-auto rounded-[5px] border border-[#dfe4eb] bg-white p-0 py-4 text-[17px] text-[#111722] shadow-[0_28px_70px_rgba(15,23,42,0.16)] ring-0 outline-none sm:w-[404px]"
        collisionAvoidance={{
          side: "shift",
          align: "shift",
          fallbackAxisSide: "none",
        }}
        collisionPadding={18}
        data-slash-menu
        initialFocus={false}
        positionMethod="fixed"
        role="menu"
        side="bottom"
        sideOffset={10}
      >
        <div className="px-[14px] pb-[9px]">
          <div className="text-[22px] font-bold leading-tight text-[#111722]">
            Add blocks
          </div>
          <div className="mt-1 text-[17px] leading-tight text-[#9aa3b1]">
            Keep typing to filter, or escape to exit
          </div>
          {filter ? (
            <div className="mt-[18px] text-[17px] leading-tight text-[#687384]">
              <span>Filtering keyword </span>
              <span
                className="rounded-[5px] bg-[#2f67b1] px-[5px] py-px text-[16px] font-semibold leading-none text-white"
                data-testid="filter-keyword-highlight"
              >
                {filter}
              </span>
            </div>
          ) : null}
        </div>

        {SLASH_COMMANDS.map((command) => {
          const isSelected = selectedCommandId === command.id;

          return (
            <button
              aria-label={command.label}
              className={`flex h-[58px] w-full items-center gap-[18px] px-[18px] text-left outline-none ${
                isSelected ? "bg-[#f1f3f6]" : "bg-white"
              }`}
              data-selected={isSelected ? "true" : undefined}
              key={command.id}
              onClick={() => onSelectCommand(command.id)}
              onMouseDown={(event) => event.preventDefault()}
              role="menuitem"
              type="button"
            >
              <Type
                aria-hidden="true"
                className="h-[34px] w-[30px] text-[#a4adbb]"
                strokeWidth={1.8}
              />
              <span className="min-w-0">
                <span className="block text-[18px] font-bold leading-[1.2] text-[#1d2635]">
                  {command.label}
                </span>
                <span className="mt-[4px] block text-[15px] leading-[1.15] text-[#9aa3b1]">
                  {command.shortcut}
                </span>
              </span>
            </button>
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
