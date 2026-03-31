import { expect } from "@wdio/globals";
import { dismissBlockingPopups } from "./helpers/dismiss-popups";
import {
  createSecondaryMarkdownLeaf,
  getProjectBrowserLeafSummary,
  openProjectBrowserFromCommand,
  resetWorkspaceToSingleMarkdownLeaf,
  triggerProjectBrowserFromCloseAllTabs,
  triggerProjectBrowserFromNewTab,
  triggerProjectBrowserFromRibbon,
  triggerProjectBrowserWhenActiveLeafBecomesEmpty,
} from "./helpers/project-browser-startup";

const DEFAULT_FILE_PATH = "Project A/note-1.md";
const SECONDARY_FILE_PATH = "Archive/old-ideas.md";
const REPETITIONS_PER_SCENARIO = 3;

interface StartupScenario {
  name: string;
  prepare: () => Promise<void>;
  trigger: () => Promise<void>;
}

async function expectProjectBrowserStartup(scenario: StartupScenario): Promise<void> {
  for (let attemptIndex = 0; attemptIndex < REPETITIONS_PER_SCENARIO; attemptIndex += 1) {
    await scenario.prepare();
    await scenario.trigger();

    const summary = await getProjectBrowserLeafSummary();
    expect(summary.activeViewType).toBe("card-browser-view");
    expect(summary.browserLeafCount).toBeGreaterThanOrEqual(1);
    expect(summary.emptyLeafCount).toBeLessThanOrEqual(1);
  }
}

describe("Project Browser startup reliability", function () {
  before(async function () {
    await dismissBlockingPopups();
  });

  it("replaces new tabs repeatedly from single-note and mixed-leaf states", async function () {
    await expectProjectBrowserStartup({
      name: "new tab from single markdown leaf",
      prepare: async () => {
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
      },
      trigger: async () => {
        await triggerProjectBrowserFromNewTab();
      },
    });

    await expectProjectBrowserStartup({
      name: "new tab with an existing browser leaf and another markdown leaf",
      prepare: async () => {
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
        await openProjectBrowserFromCommand();
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
        await createSecondaryMarkdownLeaf(SECONDARY_FILE_PATH);
      },
      trigger: async () => {
        await triggerProjectBrowserFromNewTab();
      },
    });
  });

  it("opens from the ribbon repeatedly from note and browser starting points", async function () {
    await expectProjectBrowserStartup({
      name: "ribbon from single markdown leaf",
      prepare: async () => {
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
      },
      trigger: async () => {
        await triggerProjectBrowserFromRibbon();
      },
    });

    await expectProjectBrowserStartup({
      name: "ribbon while another browser leaf already exists",
      prepare: async () => {
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
        await openProjectBrowserFromCommand();
      },
      trigger: async () => {
        await triggerProjectBrowserFromRibbon();
      },
    });
  });

  it("opens after closing all tabs repeatedly from simple and mixed states", async function () {
    await expectProjectBrowserStartup({
      name: "close all tabs from single markdown leaf",
      prepare: async () => {
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
      },
      trigger: async () => {
        await triggerProjectBrowserFromCloseAllTabs();
      },
    });

    await expectProjectBrowserStartup({
      name: "close all tabs from multiple markdown leaves plus browser leaf",
      prepare: async () => {
        await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
        await createSecondaryMarkdownLeaf(SECONDARY_FILE_PATH);
        await openProjectBrowserFromCommand();
      },
      trigger: async () => {
        await triggerProjectBrowserFromCloseAllTabs();
      },
    });
  });

  it("continues to open cleanly when startup methods are alternated", async function () {
    await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);

    await triggerProjectBrowserFromNewTab();
    await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);

    await triggerProjectBrowserFromRibbon();
    await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);

    await triggerProjectBrowserFromCloseAllTabs();

    const summary = await getProjectBrowserLeafSummary();
    expect(summary.activeViewType).toBe("card-browser-view");
    expect(summary.browserLeafCount).toBeGreaterThanOrEqual(1);
  });

  it("recovers when the active leaf becomes empty without switching leaves", async function () {
    for (let attemptIndex = 0; attemptIndex < REPETITIONS_PER_SCENARIO; attemptIndex += 1) {
      await resetWorkspaceToSingleMarkdownLeaf(DEFAULT_FILE_PATH);
      await triggerProjectBrowserWhenActiveLeafBecomesEmpty();

      const summary = await getProjectBrowserLeafSummary();
      expect(summary.activeViewType).toBe("card-browser-view");
      expect(summary.browserLeafCount).toBeGreaterThanOrEqual(1);
    }
  });
});
