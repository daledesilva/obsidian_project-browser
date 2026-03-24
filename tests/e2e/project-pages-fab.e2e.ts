import { browser, expect } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";

const FAB_MAIN_BUTTON = ".ddc_pb_project-pages-fab__main-button";
const FAB_MENU = ".ddc_pb_project-pages-fab__page-buttons";
const FAB_PAGE_BUTTON = ".ddc_pb_project-pages-fab__page-button";

const crossTypePages = {
  markdown: ["Markdown Page 1", "Markdown Page 2"],
  canvas: ["Canvas Page 1", "Canvas Page 2"],
  base: ["Base Page 1", "Base Page 2"],
} as const;

type PageType = keyof typeof crossTypePages;

function filePathFor(pageName: string): string {
  if (pageName.startsWith("Markdown")) return `Cross Type Project/${pageName}.md`;
  if (pageName.startsWith("Canvas")) return `Cross Type Project/${pageName}.canvas`;
  return `Cross Type Project/${pageName}.base`;
}

async function openFabMenu(): Promise<void> {
  const menuAlreadyOpen = await browser.execute((selector: string) => {
    const menus = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    return menus.some((menu) => {
      const rect = menu.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
  }, FAB_MENU);
  if (menuAlreadyOpen) return;

  const fabButton = await $(FAB_MAIN_BUTTON);
  await fabButton.waitForExist({ timeout: 10000 });
  await browser.execute((selector: string) => {
    const buttons = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const visibleButton = buttons.find((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    if (visibleButton) visibleButton.click();
  }, FAB_MAIN_BUTTON);
  await browser.waitUntil(
    async () =>
      browser.execute((selector: string) => {
        const menus = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
        return menus.some((menu) => {
          const rect = menu.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      }, FAB_MENU),
    { timeout: 5000, timeoutMsg: "Expected visible FAB menu to open" }
  );
}

async function clickPageByLabel(pageLabel: string): Promise<void> {
  const pageButtons = await $$(FAB_PAGE_BUTTON);
  let targetButton: WebdriverIO.Element | null = null;
  for (const pageButton of pageButtons) {
    if (!(await pageButton.isDisplayed())) continue;
    const label = await pageButton.getText();
    if (!label.includes(pageLabel)) continue;
    targetButton = pageButton;
    break;
  }

  expect(targetButton).not.toBeNull();
  expect(await targetButton!.isEnabled()).toBe(true);
  await targetButton!.click();
}

async function activeFabPageLabel(): Promise<string> {
  const activeLabel = await browser.execute((pageButtonSelector: string) => {
    const buttons = Array.from(document.querySelectorAll(pageButtonSelector)) as HTMLButtonElement[];
    const visibleButtons = buttons.filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const activeButton = visibleButtons.find((button) => button.disabled);
    return activeButton?.textContent?.trim() ?? "";
  }, FAB_PAGE_BUTTON);
  return activeLabel;
}

async function assertExactlyOneActiveVisibleButton(): Promise<void> {
  const details = await browser.execute((pageButtonSelector: string) => {
    const buttons = Array.from(document.querySelectorAll(pageButtonSelector)) as HTMLButtonElement[];
    const visibleButtons = buttons.filter((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    const activeLabels = visibleButtons
      .filter((button) => button.disabled)
      .map((button) => button.textContent?.trim() ?? "");
    return {
      activeCount: activeLabels.length,
      activeLabels,
      visibleCount: visibleButtons.length,
    };
  }, FAB_PAGE_BUTTON);

  if (details.activeCount !== 1) {
    throw new Error(
      `Expected 1 active visible button, got ${details.activeCount}. activeLabels=${JSON.stringify(
        details.activeLabels
      )} visibleCount=${details.visibleCount}`
    );
  }

  expect(details.activeCount).toBe(1);
}

async function assertMenuStillOpen(): Promise<void> {
  await browser.waitUntil(
    async () =>
      browser.execute((menuSelector: string) => {
        const menus = Array.from(document.querySelectorAll(menuSelector)) as HTMLElement[];
        return menus.some((menu) => {
          const rect = menu.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      }, FAB_MENU),
    { timeout: 5000, timeoutMsg: "Expected visible FAB menu to stay open" }
  );
}

async function assertFabButtonHighlighted(): Promise<void> {
  const isHighlighted = await browser.execute((buttonSelector: string) => {
    const buttons = Array.from(document.querySelectorAll(buttonSelector)) as HTMLButtonElement[];
    const visibleButton = buttons.find((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    return visibleButton?.classList.contains("ddc_pb_active") ?? false;
  }, FAB_MAIN_BUTTON);
  expect(isHighlighted).toBe(true);
}

async function measureFabPositionMetrics() {
  return browser.execute(() => {
    const fab = document.querySelector(".ddc_pb_project-pages-fab") as HTMLElement | null;
    if (!fab) {
      return {
        hasFab: false,
        gapFromRight: -1,
        cssOffsetVar: "",
        scrollerSummary: [],
      };
    }

    const rect = fab.getBoundingClientRect();
    const gapFromRight = window.innerWidth - rect.right;
    const cssOffsetVar = getComputedStyle(fab).getPropertyValue("--ddc-pb-fab-right-offset").trim();

    const selectors = [".cm-scroller", ".view-content", ".workspace-leaf-content .view-content"];
    const scrollerSummary = selectors.map((selector) => {
      const el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        return { selector, exists: false, scrollbarWidth: 0, hasVerticalScrollbar: false };
      }
      return {
        selector,
        exists: true,
        scrollbarWidth: el.offsetWidth - el.clientWidth,
        hasVerticalScrollbar: el.scrollHeight > el.clientHeight,
      };
    });

    return {
      hasFab: true,
      gapFromRight,
      cssOffsetVar,
      scrollerSummary,
      discoveredScrollHosts: Array.from(document.querySelectorAll("*"))
        .map((node) => node as HTMLElement)
        .filter((el) => {
          const style = getComputedStyle(el);
          const allowsScroll = style.overflowY === "auto" || style.overflowY === "scroll" || style.overflowY === "overlay";
          return allowsScroll && el.scrollHeight > el.clientHeight;
        })
        .slice(0, 8)
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          className: el.className,
          scrollbarWidth: el.offsetWidth - el.clientWidth,
          scrollHeight: el.scrollHeight,
          clientHeight: el.clientHeight,
        })),
    };
  });
}

describe("Project Pages FAB", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("keeps menu open and updates selected page for all 3x3 type transitions", async function () {
    const sourceTypes: PageType[] = ["markdown", "canvas", "base"];
    const targetTypes: PageType[] = ["markdown", "canvas", "base"];

    for (const sourceType of sourceTypes) {
      const sourcePage = crossTypePages[sourceType][0];
      await obsidianPage.openFile(filePathFor(sourcePage));
      await browser.pause(500);
      await openFabMenu();

      const sourceActiveLabel = await activeFabPageLabel();
      expect(sourceActiveLabel).toContain(sourcePage);

      for (const targetType of targetTypes) {
        const targetPage = crossTypePages[targetType][1];
        await clickPageByLabel(targetPage);
        await browser.pause(500);
        await assertMenuStillOpen();
        await assertFabButtonHighlighted();
        await assertExactlyOneActiveVisibleButton();

        const activeLabel = await activeFabPageLabel();
        expect(activeLabel).toContain(targetPage);
      }
    }
  });

  it("measures FAB right offset on markdown vs base", async function () {
    await obsidianPage.openFile(filePathFor("Markdown Page 1"));
    await browser.pause(400);
    const markdownMetrics = await measureFabPositionMetrics();
    expect(markdownMetrics.hasFab).toBe(true);

    await obsidianPage.openFile(filePathFor("Base Page 1"));
    await browser.pause(400);
    const baseMetrics = await measureFabPositionMetrics();
    expect(baseMetrics.hasFab).toBe(true);
    const markdownOffset = Number.parseInt(markdownMetrics.cssOffsetVar, 10) || 0;
    const baseOffset = Number.parseInt(baseMetrics.cssOffsetVar, 10) || 0;
    const markdownScrollbarWidth =
      markdownMetrics.scrollerSummary.find((item) => item.selector === ".cm-scroller")?.scrollbarWidth ?? 0;
    const baseScrollbarWidth =
      baseMetrics.discoveredScrollHosts.find((item) => (item.className ?? "").includes("bases-view"))?.scrollbarWidth ?? 0;

    expect(markdownOffset).toBe(markdownScrollbarWidth);
    expect(baseOffset).toBe(baseScrollbarWidth);
    expect(baseOffset).toBeGreaterThan(0);
    expect(baseMetrics.gapFromRight).toBe(baseOffset);
  });
});
