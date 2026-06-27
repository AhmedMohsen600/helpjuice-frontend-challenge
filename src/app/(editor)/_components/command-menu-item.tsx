import { Type } from "lucide-react";

import { cn } from "@/lib/utils";

import type { SlashCommandId } from "../_types/editor.types";
import { editorFocusRingClass, editorIconSize } from "./editor-style-utils";

type CommandMenuItemProps = {
  commandId: SlashCommandId;
  isSelected: boolean;
  label: string;
  onSelect: (commandId: SlashCommandId) => void;
  shortcut: string;
};

export function CommandMenuItem({
  commandId,
  isSelected,
  label,
  onSelect,
  shortcut,
}: CommandMenuItemProps) {
  return (
    <button
      aria-label={label}
      className={cn(
        "flex h-[58px] w-full items-center gap-[18px] bg-(--editor-surface) px-[18px] text-left transition-colors hover:bg-(--editor-surface-hover)",
        editorFocusRingClass,
        isSelected &&
          "bg-(--editor-surface-selected) hover:bg-(--editor-surface-selected)",
      )}
      aria-checked={isSelected}
      data-selected={isSelected ? "true" : undefined}
      onClick={() => onSelect(commandId)}
      onMouseDown={(event) => event.preventDefault()}
      role="menuitemradio"
      type="button"
    >
      <Type
        aria-hidden="true"
        className={cn(editorIconSize.command, "text-(--editor-icon-muted)")}
        strokeWidth={1.8}
      />
      <span className="min-w-0">
        <span className="block text-[18px] font-bold leading-[1.2] text-(--editor-text-heading)">
          {label}
        </span>
        <span className="mt-[4px] block text-[15px] leading-[1.15] text-(--editor-text-muted)">
          {shortcut}
        </span>
      </span>
    </button>
  );
}
