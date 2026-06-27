"use client";

import { type MouseEvent, useCallback } from "react";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import Image from "next/image";
import {
  ArrowDownLeft,
  BookOpen,
  ChevronDown,
  ChevronsRight,
  CircleCheckBig,
  Clock3,
  Cloud,
  HelpCircle,
  Menu,
  MoreVertical,
  Plus,
  Unlock,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import {
  EDITOR_BOTTOM_PADDING,
  EDITOR_DESCRIPTION,
  EDITOR_MENU_OPEN_BOTTOM_PADDING,
} from "../_constants/editor.constants";
import { useHelpjuiceEditor } from "../_hooks/use-helpjuice-editor";
import type { EditorBlock as EditorBlockData } from "../_types/editor.types";
import { getVisibleBlocks } from "../_utils/editor-block.utils";
import { EditorBlock } from "./editor-block";
import { editorFocusRingClass, editorIconSize } from "./editor-style-utils";
import { ThemeToggle } from "./theme-toggle";

const UNAVAILABLE_FEATURE_TOAST_TITLE = "Not available in this prototype";

function shouldShowContinuationHint(blocks: EditorBlockData[]) {
  const lastBlock = blocks.at(-1);

  return Boolean(lastBlock && lastBlock.text !== "");
}

export function HelpjuiceEditor() {
  const {
    activeBlockId,
    blocks,
    continueEditingAtEnd,
    deleteBlock,
    handleBlockInput,
    handleBlockKeyDown,
    isSlashMenuOpen,
    openAddBlockMenu,
    registerBlockRef,
    reorderBlocks,
    selectCommand,
    selectedCommandId,
    setActiveBlockId,
    slashFilter,
    toggleExpandableBlock,
    turnBlockIntoTextType,
  } = useHelpjuiceEditor();
  const visibleBlocks = getVisibleBlocks(blocks);
  const showContinuationHint =
    !isSlashMenuOpen && shouldShowContinuationHint(visibleBlocks);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );
  const showUnavailableFeatureToast = useCallback((featureName: string) => {
    toast.info(UNAVAILABLE_FEATURE_TOAST_TITLE, {
      description: `${featureName} is visual-only in this challenge.`,
      duration: 2600,
    });
  }, []);
  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      if (!over) return;

      reorderBlocks(String(active.id), String(over.id));
    },
    [reorderBlocks],
  );
  const handleContinuationMouseDown = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (isSlashMenuOpen) return;

      if (
        target.closest("[data-editor-block-container]") ||
        target.closest("[data-block-action-menu]") ||
        target.closest("[data-continuation-hint]") ||
        target.closest("[data-slash-menu]")
      ) {
        return;
      }

      event.preventDefault();
      continueEditingAtEnd();
    },
    [continueEditingAtEnd, isSlashMenuOpen],
  );

  return (
    <main
      className="min-h-screen overflow-x-hidden bg-(--editor-bg) text-(--editor-text-primary)"
      data-testid="editor-shell"
    >
      <section className="relative mx-auto min-h-[930px] w-full bg-(--editor-bg)">
        <header className="flex h-[80px] items-center justify-between px-8 text-[18px] font-medium text-(--editor-text-muted)">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center leading-none text-(--editor-text-muted)"
          >
            <button
              aria-label="Sidebar navigation"
              className={cn(
                "mr-[33px] inline-flex h-[18px] w-[18px] items-center justify-center border-0 bg-transparent p-0 text-(--editor-text-subtle) transition-colors hover:text-(--editor-text-primary)",
                editorFocusRingClass,
              )}
              onClick={() => showUnavailableFeatureToast("Sidebar navigation")}
              type="button"
            >
              <ChevronsRight
                aria-hidden="true"
                className={editorIconSize.inline}
                strokeWidth={2.65}
              />
            </button>
            <button
              className={cn(
                "me-[17px] inline-flex items-center border-0 bg-transparent p-0 text-(--editor-text-muted) transition-colors hover:text-(--editor-text-subtle)",
                editorFocusRingClass,
              )}
              onClick={() => showUnavailableFeatureToast("Main breadcrumb")}
              type="button"
            >
              <BookOpen
                aria-hidden="true"
                className={cn("mr-[10px]", editorIconSize.control)}
                strokeWidth={2.15}
              />
              <span className="underline decoration-(--editor-text-muted) underline-offset-[3px]">
                Main
              </span>
            </button>
            <span className="me-[18px] text-(--editor-text-muted)">/</span>
            <button
              className={cn(
                "me-[17px] border-0 bg-transparent p-0 text-(--editor-text-muted) transition-colors hover:text-(--editor-text-subtle)",
                editorFocusRingClass,
              )}
              onClick={() =>
                showUnavailableFeatureToast("Getting started breadcrumb")
              }
              type="button"
            >
              Getting started
            </button>
            <span className="me-[18px] text-(--editor-text-muted)">/</span>
            <button
              className={cn(
                "max-w-[280px] truncate border-0 bg-transparent p-0 text-(--editor-text-muted) transition-colors hover:text-(--editor-text-subtle)",
                editorFocusRingClass,
              )}
              onClick={() => showUnavailableFeatureToast("Page breadcrumb")}
              type="button"
            >
              Front-end developer test proje...
            </button>
          </nav>
          <div className="flex items-center gap-5">
            <ThemeToggle />
            <button
              className={cn(
                "inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[16px] text-(--editor-text-muted) transition-colors hover:text-(--editor-text-subtle)",
                editorFocusRingClass,
              )}
              onClick={() => showUnavailableFeatureToast("Editing status")}
              type="button"
            >
              <Unlock
                aria-hidden="true"
                className={editorIconSize.control}
                strokeWidth={2.5}
              />
              Editing
            </button>
            <span className="h-[26px] w-px bg-(--editor-divider)" />
            <button
              className={cn(
                "inline-flex items-center gap-2 text-[18px] font-bold text-(--editor-action-text) transition-opacity hover:opacity-85",
                editorFocusRingClass,
              )}
              onClick={() => showUnavailableFeatureToast("Publish Space")}
              type="button"
            >
              Publish Space
              <ChevronDown
                aria-hidden="true"
                className={editorIconSize.control}
                strokeWidth={2.5}
              />
            </button>
          </div>
        </header>

        <div
          className="mx-auto w-(--editor-content-width) pt-[10px] max-[1040px]:w-[calc(100%-64px)]"
        >
          <button
            aria-label="Page metadata toolbar"
            className={cn(
              "mb-[32px] flex h-[48px] w-full items-center justify-between rounded-(--editor-radius-md) border border-(--editor-border) bg-(--editor-surface) px-3 text-[16px] text-(--editor-text-muted) shadow-(--editor-shadow-toolbar) transition-colors hover:bg-(--editor-surface-hover)",
              editorFocusRingClass,
            )}
            onClick={() => showUnavailableFeatureToast("Page metadata")}
            type="button"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex h-[32px] w-[28px] items-center justify-center rounded-[4px] bg-(--editor-badge-bg) text-[17px] font-semibold text-(--editor-badge-text)">
                P
              </span>
              <span className="h-[24px] w-px bg-(--editor-divider)" />
              <span className="inline-flex items-center gap-1">
                <Clock3
                  aria-hidden="true"
                  className={editorIconSize.inline}
                  strokeWidth={2}
                />
                0min
              </span>
              <span className="h-[24px] w-px bg-(--editor-divider)" />
              <Image
                alt=""
                aria-hidden="true"
                className="h-[26px] w-[26px] rounded-full"
                height={26}
                src="/helpjuice-avatar.png"
                width={26}
              />
              <span className="h-[24px] w-px bg-(--editor-divider)" />
              <span className="inline-flex items-center gap-[5px] text-(--editor-text-muted)">
                <ArrowDownLeft
                  aria-hidden="true"
                  className={editorIconSize.inline}
                  strokeWidth={2.4}
                />
                0
              </span>
            </div>
            <div className="flex items-center gap-[10px] text-(--editor-text-muted)">
              <CircleCheckBig
                aria-hidden="true"
                className={editorIconSize.metadata}
                strokeWidth={2.2}
              />
              <Cloud
                aria-hidden="true"
                className={cn(
                  editorIconSize.metadata,
                  "text-(--editor-status-success)",
                )}
                strokeWidth={2.2}
              />
              <MoreVertical
                aria-hidden="true"
                className={cn(editorIconSize.drag, "text-(--editor-icon-strong)")}
                strokeWidth={3}
              />
            </div>
          </button>

          <h1 className="m-0 border-b border-(--editor-divider) pb-[13px] text-[48px] font-extrabold leading-[1.12] text-(--editor-text-primary)">
            Front-end developer test project
          </h1>
          <p className="m-0 mt-[24px] max-w-[940px] text-[19px] font-normal leading-[1.45] text-(--editor-text-secondary)">
            {EDITOR_DESCRIPTION}
          </p>

          <div
            className="relative mt-[82px] min-h-[360px] cursor-text"
            data-testid="editor-continuation-surface"
            onMouseDown={handleContinuationMouseDown}
            style={{
              paddingBottom: isSlashMenuOpen
                ? EDITOR_MENU_OPEN_BOTTOM_PADDING
                : EDITOR_BOTTOM_PADDING,
            }}
          >
            <DndContext
              collisionDetection={closestCenter}
              id="helpjuice-editor-dnd"
              onDragEnd={handleDragEnd}
              sensors={sensors}
            >
              <div className="space-y-[18px]">
                {visibleBlocks.map((block) => (
                  <EditorBlock
                    block={block}
                    isActive={block.id === activeBlockId}
                    key={block.id}
                    onFocus={setActiveBlockId}
                    onDeleteBlock={deleteBlock}
                    onOpenAddBlockMenu={openAddBlockMenu}
                    onInput={handleBlockInput}
                    onKeyDown={handleBlockKeyDown}
                    onSelectCommand={selectCommand}
                    onToggleExpandable={toggleExpandableBlock}
                    onTurnInto={turnBlockIntoTextType}
                    registerRef={registerBlockRef}
                    selectedCommandId={selectedCommandId}
                    showSlashMenu={
                      isSlashMenuOpen && block.id === activeBlockId
                    }
                    slashFilter={slashFilter}
                  />
                ))}
                {showContinuationHint ? (
                  <button
                    aria-label="Continue editing below"
                    className={cn(
                      "group/continuation relative flex h-[32px] w-full cursor-text items-center rounded-(--editor-radius-sm) border-0 bg-transparent p-0 text-left before:absolute before:left-[-96px] before:top-0 before:h-full before:w-[96px] before:content-['']",
                      editorFocusRingClass,
                    )}
                    data-continuation-hint
                    onClick={continueEditingAtEnd}
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-[-76px] top-1/2 z-10 hidden h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-(--editor-radius-sm) text-(--editor-icon-muted) group-hover/continuation:flex group-focus-visible/continuation:flex"
                      data-continuation-plus
                    >
                      <Plus
                        aria-hidden="true"
                        className={editorIconSize.control}
                      />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute left-[-42px] top-1/2 z-10 hidden h-[24px] w-[24px] -translate-y-1/2 cursor-grab items-center justify-center rounded-(--editor-radius-sm) text-(--editor-icon-faint) group-hover/continuation:flex group-focus-visible/continuation:flex"
                      data-continuation-drag
                    >
                      <Menu
                        aria-hidden="true"
                        className={editorIconSize.drag}
                        strokeWidth={2.6}
                      />
                    </span>
                  </button>
                ) : null}
              </div>
            </DndContext>
          </div>
        </div>

        <button
          aria-label="Help"
          className={cn(
            "fixed bottom-[18px] right-[18px] flex h-[48px] w-[48px] items-center justify-center rounded-(--editor-radius-lg) bg-(--editor-surface-selected) text-[28px] font-semibold text-(--editor-text-subtle) transition-colors hover:bg-(--editor-surface-hover)",
            editorFocusRingClass,
          )}
          onClick={() => showUnavailableFeatureToast("Help")}
          type="button"
        >
          <HelpCircle
            aria-hidden="true"
            className={editorIconSize.help}
            strokeWidth={2.4}
          />
        </button>
      </section>
    </main>
  );
}
