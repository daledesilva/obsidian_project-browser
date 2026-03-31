import { TAbstractFile, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import { getGlobals } from 'src/logic/stores';
import { CARD_BROWSER_VIEW_TYPE } from 'src/views/card-browser-view/card-browser-view-constants';

//////////
//////////

export interface ProjectBrowserRevealLocation {
    path: string,
    lastTouchedFilePath: string,
}

const pendingProjectBrowserRevealLeaves = new WeakSet<WorkspaceLeaf>();

function isRevealableAbstractFile(file: TAbstractFile | null | undefined): file is TFile | TFolder {
    return file instanceof TFile || file instanceof TFolder;
}

function getParentFolderForRevealTarget(target: TFile | TFolder): TFolder | null {
    return target.parent ?? null;
}

function getMostRecentProjectBrowserLeaf(): WorkspaceLeaf | null {
    const {plugin} = getGlobals();
    const activeLeaf = plugin.app.workspace.getMostRecentLeaf();
    const activeLeafViewType = activeLeaf?.view.getViewType();
    const activeLeafIsProjectBrowser = activeLeafViewType === CARD_BROWSER_VIEW_TYPE;
    if(activeLeaf && activeLeafIsProjectBrowser) return activeLeaf;

    const browserLeaves = plugin.app.workspace.getLeavesOfType(CARD_BROWSER_VIEW_TYPE);
    const mostRecentBrowserLeaf = browserLeaves[browserLeaves.length - 1] ?? null;
    return mostRecentBrowserLeaf;
}

export function getProjectBrowserRevealLocation(target: TAbstractFile): ProjectBrowserRevealLocation | null {
    const {plugin} = getGlobals();
    const vaultRoot = plugin.app.vault.getRoot();

    if(target instanceof TFolder) {
        return {
            path: target.path,
            lastTouchedFilePath: '',
        };
    }

    if(target instanceof TFile) {
        const parentFolder = target.parent ?? vaultRoot;
        return {
            path: parentFolder.path,
            lastTouchedFilePath: target.path,
        };
    }

    return null;
}

export function getProjectBrowserRevealTargetForSelection(files: TAbstractFile[]): TFile | TFolder | null {
    const revealableTargets = files.filter(isRevealableAbstractFile);
    const hasRevealableTargets = revealableTargets.length > 0;
    if(!hasRevealableTargets) return null;

    const hasSingleTarget = revealableTargets.length === 1;
    if(hasSingleTarget) return revealableTargets[0];

    const firstParentFolder = getParentFolderForRevealTarget(revealableTargets[0]);
    if(!firstParentFolder) return revealableTargets[0];

    const firstParentPath = firstParentFolder.path;
    const allTargetsShareParent = revealableTargets.every((target) => {
        const parentFolder = getParentFolderForRevealTarget(target);
        return parentFolder?.path === firstParentPath;
    });

    if(allTargetsShareParent) return firstParentFolder;

    return revealableTargets[0];
}

export async function revealInProjectBrowser(target: TAbstractFile): Promise<void> {
    const revealLocation = getProjectBrowserRevealLocation(target);
    if(!revealLocation) return;

    const {plugin} = getGlobals();
    let leaf = getMostRecentProjectBrowserLeaf();
    if(!leaf) {
        leaf = plugin.app.workspace.getLeaf(true);
    }

    const leafAlreadyPending = pendingProjectBrowserRevealLeaves.has(leaf);
    if(leafAlreadyPending) return;

    pendingProjectBrowserRevealLeaves.add(leaf);

    try {
        await leaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            active: true,
            state: {
                path: revealLocation.path,
            },
        });

        // Activate the leaf first so any Obsidian-initiated setEphemeralState
        // calls (which would clear lastTouchedFilePath) happen before we set it.
        plugin.app.workspace.setActiveLeaf(leaf, false, true);

        const existingEphemeralState = leaf.getEphemeralState?.() ?? {};
        leaf.setEphemeralState({
            ...existingEphemeralState,
            lastTouchedFilePath: revealLocation.lastTouchedFilePath,
            scrollOffset: 0,
        });
    } finally {
        pendingProjectBrowserRevealLeaves.delete(leaf);
    }
}