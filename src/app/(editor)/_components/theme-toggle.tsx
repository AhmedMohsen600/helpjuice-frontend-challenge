"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { cn } from "@/lib/utils";

import { editorFocusRingClass, editorIconSize } from "./editor-style-utils";

function subscribeToHydration() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export function ThemeToggle() {
  const isMounted = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const { resolvedTheme, setTheme, theme } = useTheme();
  const activeTheme = resolvedTheme ?? theme;
  const isDark = isMounted && activeTheme === "dark";
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      aria-label={label}
      aria-pressed={isDark}
      className={cn(
        "inline-flex h-[34px] w-[34px] items-center justify-center rounded-(--editor-radius-md) border-0 bg-transparent p-0 text-(--editor-text-muted) transition-colors hover:bg-(--editor-surface-hover) hover:text-(--editor-text-primary)",
        editorFocusRingClass,
      )}
      data-theme-toggle
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={label}
      type="button"
    >
      {isDark ? (
        <Sun aria-hidden="true" className={editorIconSize.inline} />
      ) : (
        <Moon aria-hidden="true" className={editorIconSize.inline} />
      )}
    </button>
  );
}
