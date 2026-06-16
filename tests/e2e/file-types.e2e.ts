import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import { openCardBrowserFrom, openCardBrowserAndEnterFolder } from "./helpers/open-card-browser";

describe("Project Browser File Types", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("File Types Test folder shows multiple file type cards", async function () {
    await openCardBrowserFrom("Project A/note-1.md");

    await browser.execute(() => {
      const buttons = document.querySelectorAll(".ddc_pb_folder-button");
      for (let i = 0; i < buttons.length; i++) {
        const btn = buttons[i];
        if (btn.textContent?.includes("File Types Test")) {
          (btn as HTMLElement).click();
          break;
        }
      }
    });
    await browser.pause(600);

    const stateOrStateless = await $(".ddc_pb_state-section, .ddc_pb_stateless-section");
    await stateOrStateless.waitForExist({ timeout: 8000 });
    const cards = await $$(".ddc_pb_note-card-base, .ddc_pb_project-card-base");
    expect(cards.length).toBeGreaterThanOrEqual(2);
  });

  it("Project A shows note cards in state sections", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", 0);

    const cards = await $$(".ddc_pb_note-card-base, .ddc_pb_project-card-base");
    expect(cards.length).toBeGreaterThanOrEqual(1);

    const stateSections = await $$(".ddc_pb_state-section");
    expect(stateSections.length).toBeGreaterThanOrEqual(1);
  });
});
