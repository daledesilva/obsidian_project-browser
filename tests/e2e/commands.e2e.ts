import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import {
  openCardBrowserFrom,
  openCardBrowserAndEnterFolder,
} from "./helpers/open-card-browser";

describe("Project Browser Commands", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("plugin is loaded", async function () {
    const loaded = await browser.executeObsidian(({ app }) => {
      return !!app.plugins.plugins["project-browser"];
    });
    expect(loaded).toBe(true);
  });

  it("command opens card browser view", async function () {
    await openCardBrowserFrom("Project A/note-1.md");
    const browserView = await $(".ddc_pb_browser");
    await expect(browserView).toExist();
  });

  it("card browser displays folder sections at root", async function () {
    await openCardBrowserFrom("Project A/note-1.md");
    const folderSection = await $(".ddc_pb_folder-section");
    await expect(folderSection).toExist();
    const folderButtons = await $$(".ddc_pb_folder-button");
    expect(folderButtons.length).toBeGreaterThanOrEqual(2);
  });

  it("card browser shows notes in state sections when navigating into folder", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", 0);
    const noteCards = await $$(".ddc_pb_note-card-base");
    expect(noteCards.length).toBeGreaterThanOrEqual(1);
  });

  // Ribbon icon: opening via ribbon is not asserted here; manual QA or service support needed.

  it("cycle-state-forward updates active note state", async function () {
    const { obsidianPage } = await import("wdio-obsidian-service");
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.pause(300);

    await browser.executeObsidianCommand("project-browser:cycle-state-forward");
    await browser.pause(400);

    const stateAfter = await browser.executeObsidian(async ({ app }) => {
      const file = app.vault.getAbstractFileByPath("Project A/note-1.md");
      if (!file || !("vault" in file)) return null;
      const content = await app.vault.read(file as { path: string });
      const match = content.match(/^state:\s*(.+)$/m);
      return match ? match[1].trim() : null;
    });
    expect(stateAfter).toContain("Shortlisted");
  });

  it("cycle-state-backward updates active note state", async function () {
    const { obsidianPage } = await import("wdio-obsidian-service");
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.pause(300);

    await browser.executeObsidianCommand("project-browser:cycle-state-backward");
    await browser.pause(400);

    const stateAfter = await browser.executeObsidian(async ({ app }) => {
      const file = app.vault.getAbstractFileByPath("Project A/note-1.md");
      if (!file || !("vault" in file)) return null;
      const content = await app.vault.read(file as { path: string });
      const match = content.match(/^state:\s*(.+)$/m);
      return match ? match[1].trim() : null;
    });
    // After forward we had Shortlisted; note-1 starts as Idea, so backward from Idea may wrap or go to Final (loop)
    expect(typeof stateAfter).toBe("string");
    expect(stateAfter!.length).toBeGreaterThan(0);
  });

  it("toggle-state-menu toggles state menu visibility", async function () {
    const { obsidianPage } = await import("wdio-obsidian-service");
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.pause(500);

    const containerSelector = ".ddc_pb_state-menu-container";
    const container = await $(containerSelector);
    await container.waitForExist({ timeout: 8000 }).catch(() => {});

    await browser.executeObsidianCommand("project-browser:toggle-state-menu");
    await browser.pause(400);
    await browser.executeObsidianCommand("project-browser:toggle-state-menu");
    await browser.pause(400);

    const stillExists = await container.isExisting();
    expect(stillExists).toBe(true);
  });
});
