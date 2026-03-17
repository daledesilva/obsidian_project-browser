import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";

describe("Project Browser Settings", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("settings tab opens and shows Project Browser section", async function () {
    await browser.executeObsidian(({ app }) => {
      app.setting.open();
      return true;
    });
    await browser.pause(500);

    await browser.execute(() => {
      const headers = document.querySelectorAll(".vertical-tab-header-item");
      for (const h of headers) {
        if (h.textContent?.includes("Community plugins")) {
          (h as HTMLElement).click();
          break;
        }
      }
    });

    await browser.pause(600);
    await browser.execute(() => {
      const items = document.querySelectorAll(".community-plugin-search-result, .community-plugin-item, .setting-item-name, [data-id]");
      for (const el of items) {
        if (el.textContent?.trim() === "Project Browser") {
          (el as HTMLElement).click();
          return;
        }
      }
      const all = document.body.innerText;
      if (all.includes("Project Browser")) {
        const clickables = document.querySelectorAll("a, .clickable-icon, .setting-item, div[class*='plugin']");
        for (const el of clickables) {
          if (el.textContent?.trim() === "Project Browser") {
            (el as HTMLElement).click();
            break;
          }
        }
      }
    });

    await browser.pause(500);
    const section = await $(".ddc_pb_section, .ddc_pb_settings-section");
    await section.waitForExist({ timeout: 8000 }).catch(() => null);
    const sectionExists = await section.isExisting();
    expect(sectionExists).toBe(true);
  });
});
