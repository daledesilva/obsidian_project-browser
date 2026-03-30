import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";

const BROWSER_SELECTOR = ".ddc_pb_browser";
const FOLDER_SECTION_SELECTOR = ".ddc_pb_folder-section";
const FOLDER_BUTTON_SELECTOR = ".ddc_pb_folder-button";
const DEFAULT_WAIT_MS = 10000;

/**
 * Opens the Project Browser from a given file path and waits for the browser view
 * and folder sections to be present. Use when tests need the card browser at root.
 */
export async function openCardBrowserFrom(filePath: string): Promise<void> {
  await obsidianPage.openFile(filePath);
  await browser.executeObsidianCommand("project-browser:open-project-browser");

  const browserView = await $(BROWSER_SELECTOR);
  await browserView.waitForExist({ timeout: DEFAULT_WAIT_MS });

  await browser.executeObsidian(async ({ app }) => {
    const browserLeaves = app.workspace.getLeavesOfType("card-browser-view");
    const rootPath = app.vault.getRoot().path;
    const targetLeaf = browserLeaves[browserLeaves.length - 1];
    if (!targetLeaf) return;

    await targetLeaf.setViewState({
      type: "card-browser-view",
      state: { path: rootPath },
      active: true,
    });
  });

  const folderSection = await $(FOLDER_SECTION_SELECTOR);
  await folderSection.waitForExist({ timeout: DEFAULT_WAIT_MS });
}

/**
 * Opens the card browser and navigates into the first folder (by index),
 * then waits for state sections. Use when tests need to be inside a project folder.
 * @param filePath - File to open first (e.g. "Project A/note-1.md")
 * @param folderIndex - Index of folder button to click (default 0)
 */
export async function openCardBrowserAndEnterFolder(
  filePath: string,
  folderIndex = 0
): Promise<void> {
  await openCardBrowserFrom(filePath);
  await browser.pause(400); // Allow transition-on animation (0.3s) to complete

  const folderButtons = await $$(FOLDER_BUTTON_SELECTOR);
  await folderButtons[folderIndex].waitForExist({ timeout: 5000 });
  await browser.execute(
    (sel: string, idx: number) => {
      const buttons = document.querySelectorAll(sel);
      const btn = buttons[idx];
      if (btn instanceof HTMLElement) btn.click();
    },
    FOLDER_BUTTON_SELECTOR,
    folderIndex
  );

  const stateSection = await $(".ddc_pb_state-section");
  await stateSection.waitForExist({ timeout: DEFAULT_WAIT_MS });
}

/**
 * Opens the card browser and navigates into the folder whose button text contains the given name,
 * then waits for state sections. Use when tests need a specific project folder (e.g. "Project A").
 */
export async function openCardBrowserAndEnterFolderByName(
  filePath: string,
  folderName: string
): Promise<void> {
  await openCardBrowserFrom(filePath);

  await browser.waitUntil(
    () =>
      browser.execute(
        (sel: string, name: string) => {
          const buttons = Array.from(document.querySelectorAll(sel));
          return buttons.some((button) => {
            const text = button.textContent ?? "";
            return text.includes(name);
          });
        },
        FOLDER_BUTTON_SELECTOR,
        folderName
      ),
    {
      timeout: DEFAULT_WAIT_MS,
      timeoutMsg: `Folder button containing "${folderName}" was not rendered`,
    }
  );

  const clicked = await browser.execute(
    (sel: string, name: string) => {
      const buttons = Array.from(document.querySelectorAll(sel));
      for (const button of buttons) {
        const text = button.textContent ?? "";
        if (text.includes(name)) {
          (button as HTMLElement).click();
          return true;
        }
      }
      return false;
    },
    FOLDER_BUTTON_SELECTOR,
    folderName
  );
  if (!clicked) throw new Error(`Folder button containing "${folderName}" not found`);

  await browser.pause(500);
  const stateSection = await $(".ddc_pb_state-section");
  await stateSection.waitForExist({ timeout: DEFAULT_WAIT_MS });
}
