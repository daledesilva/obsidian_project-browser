import { browser, expect } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";

describe("Project Browser New Tab Replacement", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("new leaf is replaced with card browser when replaceNewTab is true", async function () {
    await obsidianPage.openFile("Project A/note-1.md");
    await browser.pause(300);

    const cardBrowserShown = await browser.executeObsidian(({ app }) => {
      const workspace = app.workspace;
      const newLeaf = workspace.getLeaf(true);
      workspace.setActiveLeaf(newLeaf);
      return true;
    });
    expect(cardBrowserShown).toBe(true);

    await browser.pause(800);
    const browserRoot = await $(".ddc_pb_browser");
    await browserRoot.waitForExist({ timeout: 10000 });
    await expect(browserRoot).toExist();
  });
});
