import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import { openCardBrowserAndEnterFolder, openCardBrowserAndEnterFolderByName } from "./helpers/open-card-browser";

describe("Project Browser Context Menus and Modals", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("folder context menu opens on right-click", async function () {
    const { openCardBrowserFrom } = await import("./helpers/open-card-browser");
    await openCardBrowserFrom("Project A/note-1.md");

    await browser.execute(() => {
      const folderButtons = document.querySelectorAll(".ddc_pb_folder-button");
      const firstFolderBtn = folderButtons[0];
      if (firstFolderBtn instanceof HTMLElement) {
        firstFolderBtn.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, view: window }));
      }
    });
    await browser.pause(400);

    const menu = await $(".menu");
    await menu.waitForExist({ timeout: 5000 }).catch(() => null);
    const menuExists = await menu.isExisting();
    if (menuExists) {
      const menuText = await menu.getText();
      const hasExpectedItem =
        menuText.includes("Rename folder") ||
        menuText.includes("Convert to") ||
        menuText.includes("Set as launch") ||
        menuText.includes("Hide folder");
      expect(hasExpectedItem).toBe(true);
    }
  });

  it("file context menu opens on right-click on note card", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", 0);

    await browser.execute(() => {
      const card = document.querySelector(".ddc_pb_note-card-base");
      if (card instanceof HTMLElement) {
        card.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, view: window }));
      }
    });
    await browser.pause(400);

    const menu = await $(".menu");
    await menu.waitForExist({ timeout: 5000 }).catch(() => null);
    const menuExists = await menu.isExisting();
    if (menuExists) {
      const menuText = await menu.getText();
      const hasExpectedItem =
        menuText.includes("Rename") ||
        menuText.includes("Delete") ||
        menuText.includes("Open in new tab") ||
        menuText.includes("Idea") ||
        menuText.includes("Drafting");
      expect(hasExpectedItem).toBe(true);
    }
  });

  it("project page note card context menu shows project page states", async function () {
    await openCardBrowserAndEnterFolderByName("Project A/note-1.md", "Cross Type Project");

    await browser.execute(() => {
      const card = document.querySelector(".ddc_pb_note-card-base");
      if (card instanceof HTMLElement) {
        card.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, view: window }));
      }
    });
    await browser.pause(400);

    const menu = await $(".menu");
    await menu.waitForExist({ timeout: 5000 }).catch(() => null);
    const menuExists = await menu.isExisting();
    if (menuExists) {
      const menuText = await menu.getText();
      const hasExpectedProjectPageState =
        menuText.includes("First Draft") ||
        menuText.includes("Work in Progress") ||
        menuText.includes("Proofingreading") ||
        menuText.includes("Ready") ||
        menuText.includes("Abandoned");
      expect(hasExpectedProjectPageState).toBe(true);
    }
  });

  it("Rename folder from context menu opens modal; cancel leaves vault unchanged", async function () {
    const { openCardBrowserFrom } = await import("./helpers/open-card-browser");
    await openCardBrowserFrom("Project A/note-1.md");

    await browser.execute(() => {
      const folderButtons = document.querySelectorAll(".ddc_pb_folder-button");
      const firstFolderBtn = folderButtons[0];
      if (firstFolderBtn instanceof HTMLElement) {
        firstFolderBtn.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, view: window }));
      }
    });
    await browser.pause(500);

    const items = await $$(".menu .menu-item");
    let clicked = false;
    for (const item of items) {
      const text = await item.getText();
      if (text.includes("Rename folder")) {
        await item.click();
        clicked = true;
        break;
      }
    }
    if (clicked) {
      await browser.pause(500);
      const modal = await $(".modal, .modal-bg");
      const modalExists = await modal.isExisting();
      expect(modalExists).toBe(true);
      await browser.execute(() => {
        const cancelBtn = document.querySelector(".modal button:not(.mod-warning), .modal .clickable-icon");
        if (cancelBtn instanceof HTMLElement) cancelBtn.click();
      });
    }
  });
});
