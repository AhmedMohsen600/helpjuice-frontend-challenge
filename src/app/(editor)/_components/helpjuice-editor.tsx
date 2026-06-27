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

import {
  EDITOR_BOTTOM_PADDING,
  EDITOR_DESCRIPTION,
  EDITOR_MENU_OPEN_BOTTOM_PADDING,
} from "../_constants/editor.constants";
import { useHelpjuiceEditor } from "../_hooks/use-helpjuice-editor";
import type { EditorBlock as EditorBlockData } from "../_types/editor.types";
import { getVisibleBlocks } from "../_utils/editor-block.utils";
import { EditorBlock } from "./editor-block";

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
      className="overflow-x-hidden min-h-screen bg-white text-[#111722]"
      data-testid="editor-shell"
    >
      <section className="relative mx-auto min-h-[930px] w-full bg-white">
        <header className="flex h-[80px] items-center justify-between px-8 text-[18px] font-medium text-[#9aa3b1]">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center leading-none text-[#9aa3b1]"
          >
            <button
              aria-label="Sidebar navigation"
              className="mr-[33px] inline-flex h-[18px] w-[18px] items-center justify-center border-0 bg-transparent p-0 text-[#6f7885] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
              onClick={() => showUnavailableFeatureToast("Sidebar navigation")}
              type="button"
            >
              <ChevronsRight
                aria-hidden="true"
                className="h-[18px] w-[18px]"
                strokeWidth={2.65}
              />
            </button>
            <button
              className="me-[17px] inline-flex items-center border-0 bg-transparent p-0 text-[#8e98a6] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
              onClick={() => showUnavailableFeatureToast("Main breadcrumb")}
              type="button"
            >
              <BookOpen
                aria-hidden="true"
                className="mr-[10px] h-[22px] w-[22px] text-[#9aa3b1]"
                strokeWidth={2.15}
              />
              <span className="underline decoration-[#8e98a6] underline-offset-[3px]">
                Main
              </span>
            </button>
            <span className="me-[18px] text-[#9aa3b1]">/</span>
            <button
              className="me-[17px] border-0 bg-transparent p-0 text-[#9aa3b1] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
              onClick={() =>
                showUnavailableFeatureToast("Getting started breadcrumb")
              }
              type="button"
            >
              Getting started
            </button>
            <span className="me-[18px] text-[#9aa3b1]">/</span>
            <button
              className="max-w-[280px] truncate border-0 bg-transparent p-0 text-[#9aa3b1] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
              onClick={() => showUnavailableFeatureToast("Page breadcrumb")}
              type="button"
            >
              Front-end developer test proje...
            </button>
          </nav>
          <div className="flex items-center gap-5">
            <button
              className="inline-flex items-center gap-2 border-0 bg-transparent p-0 text-[16px] text-[#8f98a7] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
              onClick={() => showUnavailableFeatureToast("Editing status")}
              type="button"
            >
              <Unlock
                aria-hidden="true"
                className="h-[20px] w-[20px] text-[#9da6b2]"
                strokeWidth={2.5}
              />
              Editing
            </button>
            <span className="h-[26px] w-px bg-[#e7ebf0]" />
            <button
              className="inline-flex items-center gap-2 text-[18px] font-bold text-[#2f5f9f]"
              onClick={() => showUnavailableFeatureToast("Publish Space")}
              type="button"
            >
              Publish Space
              <ChevronDown
                aria-hidden="true"
                className="h-[20px] w-[20px]"
                strokeWidth={2.5}
              />
            </button>
          </div>
        </header>

        <div
          className="mx-auto w-[956px] pt-[10px] max-[1040px]:w-[calc(100%-64px)]"
        >
          <button
            aria-label="Page metadata toolbar"
            className="mb-[32px] flex h-[48px] w-full items-center justify-between rounded-[6px] border border-[#e5e9ef] bg-white px-3 text-[16px] text-[#9aa3b1] shadow-[0_2px_6px_rgba(15,23,42,0.06)] outline-none focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
            onClick={() => showUnavailableFeatureToast("Page metadata")}
            type="button"
          >
            <div className="flex items-center gap-4">
              <span className="inline-flex h-[32px] w-[28px] items-center justify-center rounded-[4px] bg-[#d8f6e5] text-[17px] font-semibold text-[#2c8a64]">
                P
              </span>
              <span className="h-[24px] w-px bg-[#e2e7ee]" />
              <span className="inline-flex items-center gap-1">
                <Clock3
                  aria-hidden="true"
                  className="h-[18px] w-[18px]"
                  strokeWidth={2}
                />
                0min
              </span>
              <span className="h-[24px] w-px bg-[#e2e7ee]" />
              <Image
                alt=""
                aria-hidden="true"
                className="h-[26px] w-[26px] rounded-full"
                height={26}
                src="/helpjuice-avatar.png"
                width={26}
              />
              <span className="h-[24px] w-px bg-[#e2e7ee]" />
              <span className="inline-flex items-center gap-[5px] text-[#9aa3b1]">
                <ArrowDownLeft
                  aria-hidden="true"
                  className="h-[17px] w-[17px]"
                  strokeWidth={2.4}
                />
                0
              </span>
            </div>
            <div className="flex items-center gap-[10px] text-[#9aa3b1]">
              <CircleCheckBig
                aria-hidden="true"
                className="h-[21px] w-[21px]"
                strokeWidth={2.2}
              />
              <Cloud
                aria-hidden="true"
                className="h-[22px] w-[22px] text-[#2f9b73]"
                strokeWidth={2.2}
              />
              <MoreVertical
                aria-hidden="true"
                className="h-[24px] w-[24px] text-[#171b22]"
                strokeWidth={3}
              />
            </div>
          </button>

          <h1 className="m-0 border-b border-[#e6eaf0] pb-[13px] text-[48px] font-extrabold leading-[1.12] text-[#111722]">
            Front-end developer test project
          </h1>
          <p className="m-0 mt-[24px] max-w-[940px] text-[19px] font-normal leading-[1.45] text-[#4b5565]">
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
                    className="group/continuation relative flex h-[32px] w-full cursor-text items-center rounded-[4px] border-0 bg-transparent p-0 text-left outline-none before:absolute before:left-[-96px] before:top-0 before:h-full before:w-[96px] before:content-[''] focus-visible:ring-2 focus-visible:ring-[#9aa3b1]/40"
                    data-continuation-hint
                    onClick={continueEditingAtEnd}
                    onMouseDown={(event) => event.preventDefault()}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute left-[-76px] top-1/2 z-10 hidden h-[28px] w-[28px] -translate-y-1/2 cursor-pointer items-center justify-center rounded-[4px] text-[#a4adbb] group-hover/continuation:flex group-focus-visible/continuation:flex"
                      data-continuation-plus
                    >
                      <Plus aria-hidden="true" className="h-[22px] w-[22px]" />
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute left-[-42px] top-1/2 z-10 hidden h-[24px] w-[24px] -translate-y-1/2 cursor-grab items-center justify-center rounded-[4px] text-[#d7dde6] group-hover/continuation:flex group-focus-visible/continuation:flex"
                      data-continuation-drag
                    >
                      <Menu
                        aria-hidden="true"
                        className="h-[24px] w-[24px]"
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
          className="fixed bottom-[18px] right-[18px] flex h-[48px] w-[48px] items-center justify-center rounded-[8px] bg-[#f1f3f7] text-[28px] font-semibold text-[#687384]"
          onClick={() => showUnavailableFeatureToast("Help")}
          type="button"
        >
          <HelpCircle
            aria-hidden="true"
            className="h-[29px] w-[29px]"
            strokeWidth={2.4}
          />
        </button>
      </section>
    </main>
  );
}
