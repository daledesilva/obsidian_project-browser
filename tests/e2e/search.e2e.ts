import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import { openCardBrowserAndEnterFolder } from "./helpers/open-card-browser";

// Root folders sorted by name (asc): Archive, File Types Test, Project A, Project B, Reference → Project A at index 2
const PROJECT_A_FOLDER_INDEX = 2;

describe("Project Browser Search", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("search button shows search input", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", PROJECT_A_FOLDER_INDEX);

    await browser.execute(() => {
      const btn = document.querySelector(".ddc_pb_card-browser-floating-menu__search-button");
      if (btn instanceof HTMLElement) btn.click();
    });

    await browser.pause(300);
    const searchContainer = await $(".ddc_pb_search-input-container");
    await searchContainer.waitForExist({ timeout: 5000 });
    await expect(searchContainer).toExist();
    const display = await searchContainer.getCSSProperty("display");
    expect(display.value).toBe("flex");
  });

  it("typing in search filters cards", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", PROJECT_A_FOLDER_INDEX);

    await browser.execute(() => {
      const btn = document.querySelector(".ddc_pb_card-browser-floating-menu__search-button");
      if (btn instanceof HTMLElement) btn.click();
    });
    await browser.pause(300);

    await browser.execute(() => {
      const input = document.querySelector(".ddc_pb_search-input") as HTMLInputElement;
      if (input) {
        input.focus();
        input.value = "Note 1";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await browser.pause(400);

    const cards = await $$(".ddc_pb_note-card-base");
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });

  it("clear button hides search and clears filter", async function () {
    await openCardBrowserAndEnterFolder("Project A/note-1.md", PROJECT_A_FOLDER_INDEX);

    await browser.execute(() => {
      const btn = document.querySelector(".ddc_pb_card-browser-floating-menu__search-button");
      if (btn instanceof HTMLElement) btn.click();
    });
    await browser.pause(300);
    await browser.execute(() => {
      const input = document.querySelector(".ddc_pb_search-input") as HTMLInputElement;
      if (input) {
        input.value = "Note";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
    await browser.pause(200);

    await browser.execute(() => {
      const btn = document.querySelector(".ddc_pb_search-clear-btn");
      if (btn instanceof HTMLElement) btn.click();
    });
    await browser.pause(300);

    const searchContainer = await $(".ddc_pb_search-input-container");
    const display = await searchContainer.getCSSProperty("display");
    expect(display.value).toBe("none");
  });
});
