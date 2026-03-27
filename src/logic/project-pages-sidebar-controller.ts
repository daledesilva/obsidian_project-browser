import { TFolder, ViewState, Workspace } from 'obsidian';
import { getFolderSettings } from 'src/utils/file-manipulation';
import {
    PROJECT_PAGES_SIDEBAR_VIEW_TYPE,
    ProjectPagesSidebarViewState,
} from 'src/views/project-pages-sidebar-view/project-pages-sidebar-view';
import { getGlobals } from './stores';

interface CapturedSidebarLeafState {
    viewState: ViewState;
    ephemeralState: unknown;
}

/** When the plugin replaced another left-sidebar view, this stores restoration data. */
let capturedLeftLeafRestore: CapturedSidebarLeafState | null = null;

let syncProjectPagesSidebarRequestId = 0;

/** Obsidian empty leaf — restoring this does not bring back File Explorer; treat as no prior view. */
const OBSIDIAN_EMPTY_VIEW_TYPE = 'empty';

/** `null` = not read yet this session; then `true`/`false` from `leftSplit.collapsed` before we reveal Project Pages. */
let leftSidebarCollapsedSnapshotBeforeProject: boolean | null = null;

function readLeftSidebarCollapsed(workspace: Workspace): boolean | null {
    const left = workspace.leftSplit as { collapsed?: boolean } | undefined;
    if (left && typeof left.collapsed === 'boolean') {
        return left.collapsed;
    }
    return null;
}

function applyLeftSidebarCollapseSnapshot(workspace: Workspace): void {
    if (leftSidebarCollapsedSnapshotBeforeProject !== true) {
        leftSidebarCollapsedSnapshotBeforeProject = null;
        return;
    }
    const left = workspace.leftSplit as { collapse?: () => void } | undefined;
    left?.collapse?.();
    leftSidebarCollapsedSnapshotBeforeProject = null;
}

/**
 * Keeps the Project Pages sidebar in sync with the active file: show pages when inside a project,
 * restore or clear when not.
 */
export async function syncProjectPagesSidebarFromActiveWorkspaceContext(): Promise<void> {
    const requestId = ++syncProjectPagesSidebarRequestId;
    const { plugin } = getGlobals();
    const { workspace, vault } = plugin.app;

    const activeFile = workspace.getActiveFile();
    const parentFolder = activeFile?.parent ?? null;

    const parentIsProject =
        parentFolder instanceof TFolder && (await getFolderSettings(vault, parentFolder)).isProject === true;

    if (requestId !== syncProjectPagesSidebarRequestId) {
        return;
    }

    if (!activeFile || !parentFolder || !parentIsProject) {
        await hideOrRestoreProjectPagesSidebar(workspace);
        return;
    }

    await ensureProjectPagesSidebarShowsProject(workspace, parentFolder);

    if (requestId !== syncProjectPagesSidebarRequestId) {
        return;
    }
}

async function ensureProjectPagesSidebarShowsProject(workspace: Workspace, projectFolder: TFolder): Promise<void> {
    if (leftSidebarCollapsedSnapshotBeforeProject === null) {
        const collapsed = readLeftSidebarCollapsed(workspace);
        leftSidebarCollapsedSnapshotBeforeProject = collapsed ?? false;
    }

    let leaf = workspace.getLeavesOfType(PROJECT_PAGES_SIDEBAR_VIEW_TYPE)[0];

    if (!leaf) {
        leaf = workspace.getLeftLeaf(false);
        const currentType = leaf.getViewState().type;
        if (
            currentType !== PROJECT_PAGES_SIDEBAR_VIEW_TYPE &&
            currentType !== OBSIDIAN_EMPTY_VIEW_TYPE
        ) {
            capturedLeftLeafRestore = {
                viewState: leaf.getViewState(),
                ephemeralState: leaf.getEphemeralState(),
            };
        }
    }

    const nextState: ProjectPagesSidebarViewState = {
        projectFolderPath: projectFolder.path,
    };

    await leaf.setViewState({
        type: PROJECT_PAGES_SIDEBAR_VIEW_TYPE,
        state: nextState,
        active: false,
    });
    workspace.revealLeaf(leaf);
}

async function hideOrRestoreProjectPagesSidebar(workspace: Workspace): Promise<void> {
    try {
        const leaves = workspace.getLeavesOfType(PROJECT_PAGES_SIDEBAR_VIEW_TYPE);
        if (leaves.length === 0) {
            capturedLeftLeafRestore = null;
            return;
        }

        const leaf = leaves[0];

        if (capturedLeftLeafRestore) {
            const restoreType = capturedLeftLeafRestore.viewState.type;
            if (restoreType === OBSIDIAN_EMPTY_VIEW_TYPE) {
                capturedLeftLeafRestore = null;
                workspace.detachLeavesOfType(PROJECT_PAGES_SIDEBAR_VIEW_TYPE);
                return;
            }
            try {
                await leaf.setViewState(capturedLeftLeafRestore.viewState, capturedLeftLeafRestore.ephemeralState);
            } finally {
                capturedLeftLeafRestore = null;
            }
            return;
        }

        workspace.detachLeavesOfType(PROJECT_PAGES_SIDEBAR_VIEW_TYPE);
    } finally {
        applyLeftSidebarCollapseSnapshot(workspace);
    }
}
