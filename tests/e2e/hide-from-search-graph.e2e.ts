import { browser, expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";

async function findOldIdeasFilePath(): Promise<string | null> {
  return browser.executeObsidian(async ({ app }) => {
    const match = app.vault.getFiles().find((file) => file.path.startsWith("Archive/old-ideas"));
    return match?.path ?? null;
  });
}

async function resetNoteToIdeaState(): Promise<void> {
  await browser.executeObsidian(async ({ app }) => {
    const matches = app.vault.getFiles().filter((file) => file.path.startsWith("Archive/old-ideas"));
    const file = matches[0];
    if (!file) return;

    const cleanBasename = file.basename.replace(/\s*\[(?:STATE-HIDE|HIDDEN)\]\s*/gi, "").trim();
    const cleanPath = `Archive/${cleanBasename}.md`;

    if (file.path !== cleanPath) {
      await app.vault.rename(file, cleanPath);
    }

    const resetFile = app.vault.getAbstractFileByPath(cleanPath);
    if (!resetFile || !("path" in resetFile)) return;

    await app.fileManager.processFrontMatter(resetFile as never, (frontmatter: Record<string, string | undefined>) => {
      frontmatter.state = "Idea";
    });
  });
}

async function getNoteBasename(): Promise<string | null> {
  return browser.executeObsidian(async ({ app }) => {
    const match = app.vault.getFiles().find((file) => file.path.startsWith("Archive/old-ideas"));
    return match?.basename ?? null;
  });
}

describe("Hide from search/graph", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  beforeEach(async function () {
    await resetNoteToIdeaState();
    await browser.pause(300);
  });

  it("cycle-state-backward appends [STATE-HIDE] when moving to Cancelled", async function () {
    const notePath = await findOldIdeasFilePath();
    expect(notePath).toBeTruthy();

    const { obsidianPage } = await import("wdio-obsidian-service");
    await obsidianPage.openFile(notePath!);
    await browser.pause(300);

    await browser.executeObsidianCommand("project-browser:cycle-state-backward");
    await browser.pause(500);

    const basename = await getNoteBasename();
    expect(basename).toContain("[STATE-HIDE]");
  });

  it("plugin load ensures manual and state hide exclude filters", async function () {
    const filters = await browser.executeObsidian(async ({ app }) => {
      const config = app.vault.config as { userIgnoreFilters?: string[] };
      return config.userIgnoreFilters ?? [];
    });

    expect(filters).toContain("/\\[HIDDEN\\]/");
    expect(filters).toContain("/\\[STATE-HIDE\\]/");
  });
});
