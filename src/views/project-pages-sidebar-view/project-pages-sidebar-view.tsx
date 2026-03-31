import './project-pages-sidebar-view.scss';
import { ItemView, TAbstractFile, TFile, TFolder, ViewStateResult, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { ChevronLeft } from 'lucide-react';
import {
    FabMenuActionButton,
    FabMenuActionButtonStack,
} from 'src/components/fab-menu-action-button/fab-menu-action-button';
import { ProjectPageMenuFileButton } from 'src/components/project-page-menu-file-button/project-page-menu-file-button';
import { ICON_PLUGIN } from 'src/constants';
import { openFileInMostRecentRootLeaf, openNewPageAndSelectTitle } from 'src/logic/file-access-processes';
import { getSortedPageMenuFilesInProjectFolder } from 'src/logic/project-page-list';
import { syncProjectPagesSidebarFromActiveWorkspaceContext } from 'src/logic/project-pages-sidebar-controller';
import { getGlobals } from 'src/logic/stores';
import { openStateMenuIfClosed } from 'src/logic/toggle-state-menu';
import { isRootPath } from 'src/utils/string-processes';
import { createProject } from 'src/utils/file-manipulation';
import { CARD_BROWSER_VIEW_TYPE } from 'src/views/card-browser-view/card-browser-view-constants';

export const PROJECT_PAGES_SIDEBAR_VIEW_TYPE = 'project-browser-project-pages-sidebar';

const VIEW_CONTENT_CLASS = 'ddc_pb_project-pages-sidebar-view-content';

export interface ProjectPagesSidebarViewState {
    projectFolderPath: string;
}

export function registerProjectPagesSidebarView(): void {
    const { plugin } = getGlobals();
    plugin.registerView(PROJECT_PAGES_SIDEBAR_VIEW_TYPE, (leaf) => new ProjectPagesSidebarItemView(leaf));
}

export function detachProjectPagesSidebarLeaves(): void {
    const { plugin } = getGlobals();
    plugin.app.workspace.detachLeavesOfType(PROJECT_PAGES_SIDEBAR_VIEW_TYPE);
}

interface SidebarContentProps {
    projectFolder: TFolder | null;
}

export const ProjectPagesSidebarContent = (props: SidebarContentProps) => {
    const { plugin } = getGlobals();
    const [activePath, setActivePath] = React.useState(() => plugin.app.workspace.getActiveFile()?.path ?? '');
    const [listRefreshToken, setListRefreshToken] = React.useState(0);

    React.useEffect(() => {
        const syncActivePathFromWorkspace = () => {
            setActivePath(plugin.app.workspace.getActiveFile()?.path ?? '');
        };

        function handleFileOpen(file: TFile | null) {
            setActivePath(file?.path ?? '');
        }

        // Keep selected state in sync for navigation paths that do not always emit file-open in the same order.
        const fileOpenEventRef = plugin.app.workspace.on('file-open', handleFileOpen);
        const activeLeafEventRef = plugin.app.workspace.on('active-leaf-change', syncActivePathFromWorkspace);
        syncActivePathFromWorkspace();

        return () => {
            plugin.app.workspace.offref(fileOpenEventRef);
            plugin.app.workspace.offref(activeLeafEventRef);
        };
    }, [plugin]);

    React.useEffect(() => {
        const vault = plugin.app.vault;
        const folderPath = props.projectFolder?.path;

        function bumpIfRelevant(path: string) {
            if (!folderPath) return;
            const prefix = folderPath === '' ? '' : folderPath + '/';
            if (path === folderPath || path.startsWith(prefix)) {
                setListRefreshToken((v) => v + 1);
            }
        }

        function handleCreate(file: TAbstractFile) {
            bumpIfRelevant(file.path);
        }

        function handleDelete(file: TAbstractFile) {
            bumpIfRelevant(file.path);
        }

        function handleRename(file: TAbstractFile, oldPath: string) {
            bumpIfRelevant(file.path);
            bumpIfRelevant(oldPath);
        }

        vault.on('create', handleCreate);
        vault.on('delete', handleDelete);
        vault.on('rename', handleRename);

        return () => {
            vault.off('create', handleCreate);
            vault.off('delete', handleDelete);
            vault.off('rename', handleRename);
        };
    }, [plugin.app.vault, props.projectFolder?.path]);

    const pages = React.useMemo(() => {
        if (!props.projectFolder) return [];
        void listRefreshToken;
        return getSortedPageMenuFilesInProjectFolder(props.projectFolder);
    }, [props.projectFolder, listRefreshToken]);

    if (!props.projectFolder) {
        return (
            <div className="ddc_pb_project-pages-sidebar">
                <p className="ddc_pb_project-pages-sidebar__empty">
                    Open a note inside a project folder to see its pages here.
                </p>
            </div>
        );
    }

    async function handleAddPage() {
        const newFile = await createProject({
            parentFolder: props.projectFolder,
            projectName: 'Untitled',
        });
        openNewPageAndSelectTitle(newFile);
        openStateMenuIfClosed();
    }

    function handlePageClick(file: TFile) {
        setActivePath(file.path);
        openFileInMostRecentRootLeaf(file);
    }

    async function handleOpenProjectFolder() {
        const rootSplit = plugin.app.workspace.rootSplit;
        let targetLeaf = rootSplit ? plugin.app.workspace.getMostRecentLeaf(rootSplit) : null;
        if (!targetLeaf) {
            targetLeaf = plugin.app.workspace.getMostRecentLeaf();
        }
        if (!targetLeaf) {
            targetLeaf = plugin.app.workspace.getLeaf();
        }
        await targetLeaf.setViewState({
            type: CARD_BROWSER_VIEW_TYPE,
            state: { path: props.projectFolder?.path ?? '' },
        });
        await syncProjectPagesSidebarFromActiveWorkspaceContext();
    }

    return (
        <div className="ddc_pb_project-pages-sidebar">
            <h2 className="ddc_pb_project-pages-sidebar__title">Project pages</h2>
            <div className="ddc_pb_project-pages-sidebar__scroll">
                {pages.length === 0 ? (
                    <p className="ddc_pb_project-pages-sidebar__empty">No pages in this project yet.</p>
                ) : (
                    <ul className="ddc_pb_project-pages-sidebar__list">
                        {pages.map((file) => (
                            <li key={file.path}>
                                <ProjectPageMenuFileButton
                                    file={file}
                                    isCurrentPage={file.path === activePath}
                                    context="sidebar"
                                    onPageClick={handlePageClick}
                                    onFileChange={() => setListRefreshToken((v) => v + 1)}
                                />
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <footer className="ddc_pb_project-pages-sidebar__footer">
                <FabMenuActionButtonStack>
                    <FabMenuActionButton
                        variant="primary"
                        density="compact"
                        label="Add page"
                        onClick={() => void handleAddPage()}
                    />
                </FabMenuActionButtonStack>
                <button
                    type="button"
                    className="ddc_pb_project-pages-sidebar__project-title-button"
                    onClick={() => void handleOpenProjectFolder()}
                    title={
                        isRootPath(props.projectFolder.path)
                            ? 'Open vault root in project browser'
                            : `Open ${props.projectFolder.name} in project browser`
                    }
                >
                    <ChevronLeft size={16} className="ddc_pb_project-pages-sidebar__project-title-chevron" />
                    {isRootPath(props.projectFolder.path) ? 'Home' : props.projectFolder.name}
                </button>
            </footer>
        </div>
    );
};

export class ProjectPagesSidebarItemView extends ItemView {
    root: Root | null = null;
    state: ProjectPagesSidebarViewState;

    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
        this.navigation = false;
        this.icon = ICON_PLUGIN;
        this.state = { projectFolderPath: '' };
        leaf.open(this);
    }

    getViewType(): string {
        return PROJECT_PAGES_SIDEBAR_VIEW_TYPE;
    }

    getDisplayText(): string {
        return 'Project pages';
    }

    getState(): ProjectPagesSidebarViewState {
        return this.state;
    }

    setState(nextState: unknown, result: ViewStateResult): Promise<void> {
        result.history = true;
        if (nextState && typeof nextState === 'object') {
            this.state = { ...this.state, ...(nextState as ProjectPagesSidebarViewState) };
        }
        this.renderReactContent();
        return super.setState(this.state, result);
    }

    async onOpen(): Promise<void> {
        const contentEl = this.contentEl;
        contentEl.setAttr('style', 'padding: 0;');
        contentEl.addClass(VIEW_CONTENT_CLASS);
        contentEl.empty();
        this.root = createRoot(contentEl);
        this.renderReactContent();
    }

    async onClose(): Promise<void> {
        this.root?.unmount();
        this.root = null;
    }

    private renderReactContent(): void {
        if (!this.root) return;
        const path = this.state.projectFolderPath;
        const abstract = path ? this.app.vault.getAbstractFileByPath(path) : null;
        const projectFolder = abstract instanceof TFolder ? abstract : null;

        this.root.render(<ProjectPagesSidebarContent projectFolder={projectFolder} />);
    }
}
