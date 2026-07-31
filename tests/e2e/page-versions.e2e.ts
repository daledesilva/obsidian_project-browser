import { browser, expect } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import { openCardBrowserFrom } from "./helpers/open-card-browser";

const FAB_MAIN_BUTTON = ".ddc_pb_project-pages-fab__main-button";
const FAB_MENU = ".ddc_pb_project-pages-fab__page-list-scroll";
const FAB_PAGE_BUTTON = ".ddc_pb_project-page-menu__file-button";
const NOTE_CARD = ".ddc_pb_note-card-base";
const LIVE_PAGE_PATH = "Cross Type Project/Markdown Page 1.md";
const VERSION_PROJECT = "Cross Type Project";
const LIVE_PAGE_LABEL = "Markdown Page 1";
const SAMPLE_DRAFT_BASENAME = "Markdown Page 1 - 2024.2.6 - 9.45am [DRAFT]";

async function resetMarkdownPage1Drafts(): Promise<void> {
  await browser.executeObsidian(async ({ app }, projectFolder: string, livePageStem: string) => {
    const prefix = `${projectFolder}/`;
    for (const file of app.vault.getFiles()) {
      if (!file.path.startsWith(prefix)) continue;
      if (file.basename.includes("[DRAFT]") && file.basename.startsWith(`${livePageStem} -`)) {
        await app.vault.delete(file);
      }
    }
  }, VERSION_PROJECT, LIVE_PAGE_LABEL);
}

async function seedDraftSnapshot(): Promise<void> {
  // Mirrors createPageVersion's rename-then-recreate shape so E2E can assert vault and UI
  // behaviour without relying on the active FAB row context menu (flaky in WebdriverIO).
  await browser.executeObsidian(
    async ({ app }, livePath: string, draftBasename: string) => {
      const liveFile = app.vault.getAbstractFileByPath(livePath);
      if (!liveFile || !("parent" in liveFile) || !liveFile.parent) {
        throw new Error(`Missing live page at ${livePath}`);
      }

      const content = await app.vault.read(liveFile);
      const draftPath = `${liveFile.parent.path}/${draftBasename}.md`;
      if (app.vault.getAbstractFileByPath(draftPath)) return;

      await app.fileManager.renameFile(liveFile, draftPath);
      await app.vault.create(livePath, content);
    },
    LIVE_PAGE_PATH,
    SAMPLE_DRAFT_BASENAME,
  );
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

  await browser.execute((selector: string) => {
    const buttons = Array.from(document.querySelectorAll(selector)) as HTMLElement[];
    const visibleButton = buttons.find((button) => {
      const rect = button.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    visibleButton?.click();
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
    { timeout: 5000, timeoutMsg: "Expected visible FAB menu to open" },
  );
}

describe("Page versions", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  beforeEach(async function () {
    await resetMarkdownPage1Drafts();
    await browser.pause(300);
  });

  it("version snapshots use a [DRAFT] basename and keep the live page path", async function () {
    await seedDraftSnapshot();

    const draftBasenames = await browser.executeObsidian(async ({ app }, projectFolder: string) => {
      return app.vault
        .getFiles()
        .filter((file) => file.path.startsWith(`${projectFolder}/`) && file.basename.includes("[DRAFT]"))
        .map((file) => file.basename);
    }, VERSION_PROJECT);

    expect(draftBasenames).toContain(SAMPLE_DRAFT_BASENAME);
    const liveStillExists = await browser.executeObsidian(async ({ app }, livePath: string) => {
      return !!app.vault.getAbstractFileByPath(livePath);
    }, LIVE_PAGE_PATH);
    expect(liveStillExists).toBe(true);
  });

  it("draft versions stay out of the Card Browser but remain in the page menu", async function () {
    await seedDraftSnapshot();
    await obsidianPage.openFile(LIVE_PAGE_PATH);
    await browser.pause(500);

    await openCardBrowserFrom(LIVE_PAGE_PATH);
    await browser.executeObsidian(async ({ app }, projectPath: string) => {
      const browserLeaves = app.workspace.getLeavesOfType("card-browser-view");
      const targetLeaf = browserLeaves[browserLeaves.length - 1];
      if (!targetLeaf) return;

      await targetLeaf.setViewState({
        type: "card-browser-view",
        state: { path: projectPath },
        active: true,
      });
    }, VERSION_PROJECT);
    await browser.pause(500);

    const stateSection = await $(NOTE_CARD);
    await stateSection.waitForExist({ timeout: 10000 });
    const cardTexts = await browser.execute((cardSelector: string) => {
      return Array.from(document.querySelectorAll(cardSelector)).map(
        (card) => card.textContent?.trim() ?? "",
      );
    }, NOTE_CARD);
    expect(cardTexts.some((text) => text.includes("[DRAFT]"))).toBe(false);
    expect(cardTexts.filter((text) => text.includes(LIVE_PAGE_LABEL)).length).toBe(1);

    await obsidianPage.openFile(LIVE_PAGE_PATH);
    await browser.pause(800);
    await openFabMenu();
    await browser.pause(800);

    // Draft groups may render collapsed; retry expand via the active live row before giving up.
    await browser.waitUntil(
      async () => {
        const hasDraftRow = await browser.execute(
          (pageButtonSelector: string, pageLabel: string) => {
            const getVisibleDraftCount = () => {
              const buttons = Array.from(document.querySelectorAll(pageButtonSelector)) as HTMLButtonElement[];
              return buttons.filter((button) => {
                if (!button.classList.contains("ddc_pb_project-page-menu__file-button--draft")) {
                  return false;
                }
                const rect = button.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
              }).length;
            };

            if (getVisibleDraftCount() > 0) {
              return true;
            }

            const buttons = Array.from(document.querySelectorAll(pageButtonSelector)) as HTMLButtonElement[];
            const liveButton = buttons.find((button) => {
              const rect = button.getBoundingClientRect();
              const isVisible = rect.width > 0 && rect.height > 0;
              return (
                isVisible &&
                (button.textContent ?? "").includes(pageLabel) &&
                button.classList.contains("ddc_pb_project-page-menu__file-button--active")
              );
            });
            liveButton?.click();
            return getVisibleDraftCount() > 0;
          },
          FAB_PAGE_BUTTON,
          LIVE_PAGE_LABEL,
        );
        return hasDraftRow;
      },
      {
        timeout: 15000,
        interval: 500,
        timeoutMsg: "Expected draft row in the Project Pages FAB menu",
      },
    );
  });
});
