import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import {
  openCardBrowserFrom,
  openCardBrowserAndEnterFolder,
} from "./helpers/open-card-browser";

describe("Project Browser Navigation", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("back button returns to root folder list", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", 0);

    const backButton = await $(".ddc_pb_back-button-and-path .ddc_pb_icon");
    await backButton.waitForExist({ timeout: 5000 });
    await browser.execute(() => {
      const btn = document.querySelector(".ddc_pb_back-button-and-path .ddc_pb_icon");
      if (btn instanceof HTMLElement) btn.click();
    });

    await browser.pause(400);
    const folderSection = await $(".ddc_pb_folder-section");
    await folderSection.waitForExist({ timeout: 8000 });
    await expect(folderSection).toExist();
  });

  it("breadcrumb root click returns to root folder list", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", 0);

    // Click the first breadcrumb link (root / vault name)
    await browser.execute(() => {
      const breadcrumb = document.querySelector(".ddc_pb_back-button-and-path");
      if (!breadcrumb) return;
      const link = breadcrumb.querySelector("a");
      if (link instanceof HTMLElement) link.click();
    });

    await browser.pause(400);
    const folderSection = await $(".ddc_pb_folder-section");
    await folderSection.waitForExist({ timeout: 8000 });
    await expect(folderSection).toExist();
  });

  it("opening a note card opens the note in the same leaf", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", 0);

    const noteCards = await $$(".ddc_pb_note-card-base");
    expect(noteCards.length).toBeGreaterThanOrEqual(1);
    await browser.execute(() => {
      const card = document.querySelector(".ddc_pb_note-card-base");
      if (card instanceof HTMLElement) card.click();
    });

    await browser.pause(500);
    const markdownView = await $(".markdown-reading-view, .cm-editor");
    await markdownView.waitForExist({ timeout: 8000 });
    await expect(markdownView).toExist();
  });
});
