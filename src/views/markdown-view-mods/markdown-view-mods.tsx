import './markdown-view-mods.scss';
import { FileView, ItemView, MarkdownView, Menu, MenuItem, TFile, TFolder, View, WorkspaceLeaf } from "obsidian";
import * as React from "react";
import { createRoot } from "react-dom/client";
import { StateMenu } from 'src/components/state-menu/state-menu';
import { ProjectPagesFAB } from 'src/components/project-pages-fab/project-pages-fab';
import { getGlobals, getStateMenuSettings } from 'src/logic/stores';
import { toggleStateMenu } from 'src/logic/toggle-state-menu';
import { openStateMenuIfClosed } from 'src/logic/toggle-state-menu';
import { openFileInSameLeaf, openNewPageAndSelectTitle } from 'src/logic/file-access-processes';
import { createProject, createProjectFromNote, getFolderSettings } from 'src/utils/file-manipulation';
import { CARD_BROWSER_VIEW_TYPE } from 'src/views/card-browser-view/card-browser-view-constants';

//////////
//////////

const stateMenuContainerClassName = 'ddc_pb_state-menu-container';
const projectPagesFabContainerClassName = 'ddc_pb_project-pages-fab-container';
let keepProjectPagesFabMenuOpenUntilMs = 0;
let projectPagesFabRenderRequestId = 0;

interface ProjectPagesFabRoot {
    unmount: () => void;
    render: (element: React.ReactElement) => void;
}

interface StateMenuRoot {
    unmount: () => void;
    render: (element: React.ReactElement) => void;
}

function isFileView(leaf: WorkspaceLeaf | null): leaf is WorkspaceLeaf & { view: FileView } {
    return !!leaf && leaf.view instanceof FileView;
}

//////////

export function registerMarkdownViewMods() {
    const {plugin} = getGlobals();

    addViewMenuOptions();

    // NOTE: Opening a different file in the same leaf counts as an active-leaf-change, but the header gets replaced, it updates.
    plugin.registerEvent(plugin.app.workspace.on('active-leaf-change', (leaf) => {
        if (!leaf) return;

        // TODO: This is to be re-enabled in v0.5
        // void syncProjectPagesSidebarFromActiveWorkspaceContext();

        if (isFileView(leaf)) {
            const keepMenuOpen = Date.now() < keepProjectPagesFabMenuOpenUntilMs;
            void addOrRemoveProjectPagesFAB({ keepMenuOpen });
            if (leaf.view instanceof MarkdownView) {
                addStateHeader();
            }
        }
    }));

    plugin.registerEvent(plugin.app.workspace.on('file-open', () => {
        // TODO: This is to be re-enabled in v0.5
        // void syncProjectPagesSidebarFromActiveWorkspaceContext();

        const activeLeaf = plugin.app.workspace.getMostRecentLeaf();
        if (!activeLeaf || !isFileView(activeLeaf)) return;

        const keepMenuOpen = Date.now() < keepProjectPagesFabMenuOpenUntilMs;
        void addOrRemoveProjectPagesFAB({ keepMenuOpen });
        if (activeLeaf.view instanceof MarkdownView) {
            addStateHeader();
        }
    }));
}

function addViewMenuOptions() {
    const {plugin} = getGlobals();
    plugin.app.workspace.on('file-menu', (menu, file, source) => {
        if(source !== 'more-options') return;
        menu.addItem((item: MenuItem) => {
            item.setTitle('Toggle State Menu');
            item.setChecked(getStateMenuSettings().visible);
            item.onClick(toggleStateMenu);
            item.setSection('pane');
            item.setIcon('file-check');
        });
    });
}

function addActionButtons(view: View) {
    // TODO: Currently adding an extra button every time the view is clicked in.
    if (!(view instanceof MarkdownView)) return;
    const element = view.addAction('file-stack', 'Toggle State Menu', toggleStateMenu);
}

function addStateHeader() {
    const {plugin} = getGlobals();
    let { workspace } = plugin.app;
    let leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if(!leaf) return;

    const activeFile = workspace.getActiveFile();
    if(!activeFile) return;

    const containerEl = leaf.view.containerEl;
    let stateMenuContainerEl = containerEl.find(`.${stateMenuContainerClassName}`)
    if(!stateMenuContainerEl) {
        const headerEl = containerEl.children[0];
        stateMenuContainerEl = headerEl.createDiv(stateMenuContainerClassName);
        headerEl.after(stateMenuContainerEl);
        const stateMenuRoot = createRoot(stateMenuContainerEl);
        (stateMenuContainerEl as HTMLElement & { __stateMenuRoot?: StateMenuRoot }).__stateMenuRoot = stateMenuRoot;
    }

    const stateEl = stateMenuContainerEl as HTMLElement & { __stateMenuRoot?: StateMenuRoot };
    const stateMenuRoot = stateEl.__stateMenuRoot;
    if (stateMenuRoot) {
        stateMenuRoot.render(
            <StateMenu file={activeFile}/>
        );
    }
}

interface AddOrRemoveProjectPagesFABOptions {
    keepMenuOpen?: boolean;
}

async function addOrRemoveProjectPagesFAB(options?: AddOrRemoveProjectPagesFABOptions) {
    const requestId = ++projectPagesFabRenderRequestId;
    const {plugin} = getGlobals();
    const workspace = plugin.app.workspace;
    const activeFileAtStart = workspace.getActiveFile();
    const resolvedParentFolderAtStart = activeFileAtStart?.parent ?? plugin.app.vault.getRoot();
    let parentIsProject =
        resolvedParentFolderAtStart instanceof TFolder &&
        (await getFolderSettings(plugin.app.vault, resolvedParentFolderAtStart)).isProject === true;

    if (requestId !== projectPagesFabRenderRequestId) return;
    const leaf = workspace.getActiveViewOfType(ItemView)?.leaf;
    if (!leaf) return;
    const containerEl = leaf.view.containerEl;
    const activeFile = workspace.getActiveFile();

    cleanupInactiveProjectPagesFABs(containerEl);
    let fabContainerEl = containerEl.find(`.${projectPagesFabContainerClassName}`);

    if (!activeFile) {
        removeProjectPagesFAB(containerEl);
        return;
    }

    const parentFolder = (activeFile.parent ?? plugin.app.vault.getRoot());
    if (parentFolder.path !== resolvedParentFolderAtStart.path) {
        parentIsProject = (await getFolderSettings(plugin.app.vault, parentFolder)).isProject === true;
        if (requestId !== projectPagesFabRenderRequestId) return;
    }

    let parentIsInsideProject = false;
    if (!parentIsProject) {
        let ancestor = parentFolder.parent;
        while (ancestor) {
            const ancestorSettings = await getFolderSettings(plugin.app.vault, ancestor);
            if (ancestorSettings.isProject === true) {
                parentIsInsideProject = true;
                break;
            }
            ancestor = ancestor.parent ?? null;
        }
        if (requestId !== projectPagesFabRenderRequestId) return;
    }

    function onNavigateToPage(file: TFile) {
        keepProjectPagesFabMenuOpenUntilMs = Date.now() + 1500;
        openFileInSameLeaf(file);
        openStateMenuIfClosed();
    }

    function onOpenProjectFolder(folder: TFolder) {
        const activeLeaf = workspace.getMostRecentLeaf();
        if (activeLeaf) {
            void activeLeaf.setViewState({
                type: CARD_BROWSER_VIEW_TYPE,
                state: { path: folder.path },
            });
        }
    }

    async function onNewFile() {
        const newFile = await createProject({
            parentFolder,
            projectName: 'Untitled',
        });
        openNewPageAndSelectTitle(newFile);
        // Defer refresh; vault events in FAB will update the page list
        window.setTimeout(() => addOrRemoveProjectPagesFAB({ keepMenuOpen: true }), 0);
    }

    async function onAddPage() {
        if (parentIsProject) {
            const newFile = await createProject({
                parentFolder,
                projectName: 'Untitled',
            });
            openNewPageAndSelectTitle(newFile);
            openStateMenuIfClosed();
        } else {
            const newFile = await createProjectFromNote(activeFile, parentFolder);
            openNewPageAndSelectTitle(newFile);
        }
        // Defer refresh; vault events in FAB will update the page list
        window.setTimeout(() => addOrRemoveProjectPagesFAB({ keepMenuOpen: true }), 0);
    }

    if (!fabContainerEl) {
        fabContainerEl = containerEl.createDiv(projectPagesFabContainerClassName);
        containerEl.appendChild(fabContainerEl);
        const root = createRoot(fabContainerEl);
        (fabContainerEl as HTMLElement & { __projectPagesFabRoot?: ProjectPagesFabRoot }).__projectPagesFabRoot = root;
    }

    const fabEl = fabContainerEl as HTMLElement & {
        __projectPagesFabRoot?: ProjectPagesFabRoot;
    };

    const root = fabEl.__projectPagesFabRoot;
    if (root) {
        root.render(
            <ProjectPagesFAB
                projectFolder={parentFolder}
                currentFile={activeFile}
                parentIsProject={parentIsProject}
                parentIsInsideProject={parentIsInsideProject}
                initialMenuOpen={options?.keepMenuOpen}
                onNavigateToPage={onNavigateToPage}
                onOpenProjectFolder={onOpenProjectFolder}
                onNewProject={onNewFile}
                onAddPage={onAddPage}
            />
        );
    }
}

function cleanupInactiveProjectPagesFABs(activeContainerEl: HTMLElement) {
    const fabContainers = Array.from(document.querySelectorAll(`.${projectPagesFabContainerClassName}`));
    for (const fabContainer of fabContainers) {
        if (!(fabContainer.instanceOf(HTMLElement))) continue;
        if (activeContainerEl.contains(fabContainer)) continue;
        removeProjectPagesFABElement(fabContainer);
    }
}

function removeProjectPagesFAB(containerEl: HTMLElement) {
    const fabContainerEl = containerEl.find(`.${projectPagesFabContainerClassName}`);
    if (!fabContainerEl) return;

    removeProjectPagesFABElement(fabContainerEl);
}

function removeProjectPagesFABElement(fabContainerEl: HTMLElement) {
    if (!fabContainerEl) return;

    const el = fabContainerEl as HTMLElement & {
        __projectPagesFabRoot?: ProjectPagesFabRoot;
    };
    if (el.__projectPagesFabRoot) {
        el.__projectPagesFabRoot.unmount();
        delete el.__projectPagesFabRoot;
    }
    fabContainerEl.remove();
}
