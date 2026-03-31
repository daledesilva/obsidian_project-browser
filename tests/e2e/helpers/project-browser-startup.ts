import { browser } from "@wdio/globals";
import { obsidianPage } from "wdio-obsidian-service";

const BROWSER_SELECTOR = ".ddc_pb_browser";
const DEFAULT_WAIT_MS = 10000;

interface ProjectBrowserLeafSummary {
	activeViewType: string | null;
	browserLeafCount: number;
	markdownLeafCount: number;
	emptyLeafCount: number;
}

export async function getProjectBrowserLeafSummary(): Promise<ProjectBrowserLeafSummary> {
	return browser.executeObsidian(({ app }) => {
		const { workspace } = app;
		const activeLeaf = workspace.getMostRecentLeaf();
		const activeViewType = activeLeaf?.view?.getViewType?.() ?? null;

		return {
			activeViewType,
			browserLeafCount:
				workspace.getLeavesOfType("card-browser-view").length,
			markdownLeafCount: workspace.getLeavesOfType("markdown").length,
			emptyLeafCount: workspace.getLeavesOfType("empty").length,
		};
	});
}

export async function waitForProjectBrowserVisible(
	timeout = DEFAULT_WAIT_MS,
): Promise<void> {
	await browser.waitUntil(
		async () => {
			const summary = await getProjectBrowserLeafSummary();
			const browserRoot = await $(BROWSER_SELECTOR);
			const browserExists = await browserRoot.isExisting();

			return (
				summary.activeViewType === "card-browser-view" &&
				summary.browserLeafCount >= 1 &&
				browserExists
			);
		},
		{
			timeout,
			timeoutMsg: "Project Browser did not become the active view",
		},
	);

	const browserRoot = await $(BROWSER_SELECTOR);
	await browserRoot.waitForExist({ timeout });
}

export async function resetWorkspaceToSingleMarkdownLeaf(
	filePath: string,
): Promise<void> {
	await obsidianPage.openFile(filePath);
	await browser.pause(400);

	await browser.executeObsidian(({ app }) => {
		const { workspace } = app;
		const activeLeaf = workspace.getMostRecentLeaf();
		const workspaceAny = workspace as typeof workspace & {
			iterateAllLeaves?: (callback: (leaf: unknown) => void) => void;
		};
		const leavesToDetach: Array<{
			detach?: () => void;
			view?: { getViewType?: () => string };
		}> = [];

		if (typeof workspaceAny.iterateAllLeaves === "function") {
			workspaceAny.iterateAllLeaves((leaf) => {
				const workspaceLeaf = leaf as {
					detach?: () => void;
					view?: { getViewType?: () => string };
				} | null;
				if (!workspaceLeaf || workspaceLeaf === activeLeaf) return;

				const viewType = workspaceLeaf.view?.getViewType?.();
				const isTestLeaf =
					viewType === "markdown" ||
					viewType === "empty" ||
					viewType === "card-browser-view";

				if (isTestLeaf) {
					leavesToDetach.push(workspaceLeaf);
				}
			});
		}

		for (const leaf of leavesToDetach) {
			leaf.detach?.();
		}

		if (activeLeaf) {
			workspace.setActiveLeaf(activeLeaf, false, true);
		}
	});

	await browser.pause(300);
}

export async function createSecondaryMarkdownLeaf(
	filePath: string,
): Promise<void> {
	await browser.executeObsidian(async ({ app }, targetFilePath: string) => {
		const file = app.vault.getAbstractFileByPath(targetFilePath);
		if (!file || !("path" in file)) return;

		const leaf = app.workspace.getLeaf(true);
		await leaf.openFile(file as typeof file & { path: string });
		app.workspace.setActiveLeaf(leaf, false, true);
	}, filePath);

	await browser.pause(300);
}

export async function triggerProjectBrowserFromNewTab(): Promise<void> {
	await browser.executeObsidian(({ app }) => {
		const leaf = app.workspace.getLeaf(true);
		app.workspace.setActiveLeaf(leaf, false, true);
	});

	await waitForProjectBrowserVisible();
}

export async function triggerProjectBrowserFromRibbon(): Promise<void> {
	await browser.waitUntil(
		() =>
			browser.execute(() => {
				const clickableElements = Array.from(
					document.querySelectorAll("[aria-label], [title]"),
				);
				const ribbonButton = clickableElements.find((element) => {
					const label =
						element.getAttribute("aria-label") ??
						element.getAttribute("title") ??
						element.textContent ??
						"";

					return label.toLowerCase().includes("open project browser");
				});

				if (!(ribbonButton instanceof HTMLElement)) return false;

				ribbonButton.click();
				return true;
			}),
		{
			timeout: DEFAULT_WAIT_MS,
			timeoutMsg: "Open project browser ribbon button was not found",
		},
	);

	await waitForProjectBrowserVisible();
}

export async function triggerProjectBrowserFromCloseAllTabs(): Promise<void> {
	await browser.executeObsidian(({ app }) => {
		const { workspace } = app;
		const workspaceAny = workspace as typeof workspace & {
			iterateAllLeaves?: (callback: (leaf: unknown) => void) => void;
		};
		const nonActiveLeavesToDetach: Array<{
			detach?: () => void;
			view?: { getViewType?: () => string };
		}> = [];
		let activeLeafToDetach: {
			detach?: () => void;
			view?: { getViewType?: () => string };
		} | null = null;
		const activeLeaf = workspace.getMostRecentLeaf();

		if (typeof workspaceAny.iterateAllLeaves === "function") {
			workspaceAny.iterateAllLeaves((leaf) => {
				const workspaceLeaf = leaf as {
					detach?: () => void;
					view?: { getViewType?: () => string };
				} | null;
				if (!workspaceLeaf) return;

				const viewType = workspaceLeaf.view?.getViewType?.();
				const isTestLeaf =
					viewType === "markdown" ||
					viewType === "empty" ||
					viewType === "card-browser-view";

				if (isTestLeaf) {
					if (workspaceLeaf === activeLeaf) {
						activeLeafToDetach = workspaceLeaf;
					} else {
						nonActiveLeavesToDetach.push(workspaceLeaf);
					}
				}
			});
		}

		for (const leaf of nonActiveLeavesToDetach) {
			leaf.detach?.();
		}

		activeLeafToDetach?.detach?.();
	});

	await waitForProjectBrowserVisible();
}

export async function triggerProjectBrowserWhenActiveLeafBecomesEmpty(): Promise<void> {
	await browser.executeObsidian(async ({ app }) => {
		const activeLeaf = app.workspace.getMostRecentLeaf();
		if (!activeLeaf) return;

		await activeLeaf.setViewState({
			type: "empty",
			active: true,
		});
	});

	await waitForProjectBrowserVisible();
}

export async function openProjectBrowserFromCommand(): Promise<void> {
	await browser.executeObsidianCommand(
		"project-browser:open-project-browser",
	);
	await waitForProjectBrowserVisible();
}
