import { Popover, PopoverContent } from "@/components/ui/popover";

import { SLASH_COMMANDS } from "../_constants/editor.constants";
import type { SlashCommandId } from "../_types/editor.types";
import { CommandMenuItem } from "./command-menu-item";

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
  const visibleCommands = filter
    ? SLASH_COMMANDS.filter((command) => command.filterKey === filter)
    : SLASH_COMMANDS;

  return (
    <Popover open>
      <PopoverContent
        align="start"
        anchor={anchorElement}
        aria-label="Add blocks"
        className="max-h-[calc(100vh-32px)] w-[min(var(--editor-command-menu-width),calc(100vw-32px))] gap-0 overflow-y-auto rounded-(--editor-radius-md) border border-(--editor-border) bg-(--editor-surface) p-0 py-4 text-[16px] text-(--editor-text-primary) shadow-(--editor-shadow-menu) ring-0 outline-none sm:text-[17px]"
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
          <div className="text-[22px] font-bold leading-tight text-(--editor-text-primary)">
            Add blocks
          </div>
          <div className="mt-1 text-[17px] leading-tight text-(--editor-text-muted)">
            Keep typing to filter, or escape to exit
          </div>
          {filter ? (
            <div className="mt-[18px] text-[17px] leading-tight text-(--editor-text-subtle)">
              <span>Filtering keyword </span>
              <span
                className="rounded-[5px] bg-(--editor-filter-bg) px-[5px] py-px text-[16px] font-semibold leading-none text-(--editor-filter-text)"
                data-testid="filter-keyword-highlight"
              >
                {filter}
              </span>
            </div>
          ) : null}
        </div>

        {visibleCommands.map((command) => {
          const isSelected = selectedCommandId === command.id;

          return (
            <CommandMenuItem
              commandId={command.id}
              isSelected={isSelected}
              key={command.id}
              label={command.label}
              onSelect={onSelectCommand}
              shortcut={command.shortcut}
            />
          );
        })}
      </PopoverContent>
    </Popover>
  );
}
