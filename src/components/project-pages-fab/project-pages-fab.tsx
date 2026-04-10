import './project-pages-fab.scss';
import { TAbstractFile, TFile, TFolder } from 'obsidian';
import * as React from 'react';
import { ChevronLeft, FileStack, Plus } from 'lucide-react';
import classNames from 'classnames';
import { ProjectPageMenuFileButton } from 'src/components/project-page-menu-file-button/project-page-menu-file-button';
import { getSortedPageMenuFilesInProjectFolder } from 'src/logic/project-page-list';
import { isRootPath } from 'src/utils/string-processes';
import {
    FabMenuActionButton,
    FabMenuActionButtonStack,
} from 'src/components/fab-menu-action-button/fab-menu-action-button';

//////////
//////////

const PAGE_LIST_EDGE_FADE_DEPTH_PX = 24;
const PAGE_LIST_SCROLL_EPSILON_PX = 1;

interface ProjectPagesFABProps {
    projectFolder: TFolder;
    currentFile: TFile;
    parentIsProject: boolean;
    parentIsInsideProject: boolean;
    initialMenuOpen?: boolean;
    onNavigateToPage: (file: TFile) => void;
    onOpenProjectFolder: (folder: TFolder) => void;
    onNewProject?: () => void | Promise<void>;
    onAddPage?: () => void | Promise<void>;
}

function isPathInFolder(filePath: string, parentPath: string): boolean {
    const fileParentPath = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
    return fileParentPath === parentPath;
}

export const ProjectPagesFAB = (props: ProjectPagesFABProps) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(!!props.initialMenuOpen);
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const [pageListHasOverflow, setPageListHasOverflow] = React.useState(false);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);
    const pageListScrollRef = React.useRef<HTMLDivElement>(null);
    const pageListInnerRef = React.useRef<HTMLDivElement>(null);

    const pagesInProject = React.useMemo(() => {
        void refreshTrigger;
        return getSortedPageMenuFilesInProjectFolder(props.projectFolder);
    }, [props.projectFolder, refreshTrigger]);

    React.useEffect(() => {
        const vault = props.projectFolder.vault;
        const projectPath = props.projectFolder.path;

        function checkAndRefresh(path: string) {
            if (isPathInFolder(path, projectPath)) {
                setRefreshTrigger((t) => t + 1);
            }
        }

        function handleCreate(file: TAbstractFile) {
            checkAndRefresh(file.path);
        }

        function handleDelete(file: TAbstractFile) {
            checkAndRefresh(file.path);
        }

        function handleRename(file: TAbstractFile, oldPath: string) {
            checkAndRefresh(file.path);
            checkAndRefresh(oldPath);
        }

        vault.on('create', handleCreate);
        vault.on('delete', handleDelete);
        vault.on('rename', handleRename);

        return () => {
            vault.off('create', handleCreate);
            vault.off('delete', handleDelete);
            vault.off('rename', handleRename);
        };
    }, [props.projectFolder]);

    const syncPageListScrollPresentation = React.useCallback(() => {
        const scrollEl = pageListScrollRef.current;
        if (!scrollEl) return;

        const hasOverflow = scrollEl.scrollHeight > scrollEl.clientHeight + PAGE_LIST_SCROLL_EPSILON_PX;
        setPageListHasOverflow(hasOverflow);

        const fadeDepth = `${PAGE_LIST_EDGE_FADE_DEPTH_PX}px`;
        if (!hasOverflow) {
            scrollEl.style.setProperty('--ddc-pb-page-list-fade-top', '0px');
            scrollEl.style.setProperty('--ddc-pb-page-list-fade-bottom', '0px');
            return;
        }

        const atTop = scrollEl.scrollTop <= PAGE_LIST_SCROLL_EPSILON_PX;
        const atBottom =
            scrollEl.scrollTop + scrollEl.clientHeight >=
            scrollEl.scrollHeight - PAGE_LIST_SCROLL_EPSILON_PX;

        scrollEl.style.setProperty('--ddc-pb-page-list-fade-top', atTop ? '0px' : fadeDepth);
        scrollEl.style.setProperty('--ddc-pb-page-list-fade-bottom', atBottom ? '0px' : fadeDepth);
    }, []);

    function handlePageListScroll() {
        syncPageListScrollPresentation();
    }

    React.useLayoutEffect(() => {
        if (!menuIsOpen || !props.parentIsProject) {
            setPageListHasOverflow(false);
            return;
        }
        syncPageListScrollPresentation();
        const frameId = requestAnimationFrame(syncPageListScrollPresentation);
        return () => cancelAnimationFrame(frameId);
    }, [menuIsOpen, props.parentIsProject, pagesInProject, refreshTrigger, syncPageListScrollPresentation]);

    React.useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return;
        if (!menuIsOpen || !props.parentIsProject) return;
        const scrollEl = pageListScrollRef.current;
        const innerEl = pageListInnerRef.current;
        if (!scrollEl) return;
        const resizeObserver = new ResizeObserver(() => syncPageListScrollPresentation());
        resizeObserver.observe(scrollEl);
        if (innerEl) resizeObserver.observe(innerEl);
        return () => resizeObserver.disconnect();
    }, [menuIsOpen, props.parentIsProject, syncPageListScrollPresentation]);

    React.useEffect(() => {
        function handleClickOutside(event: PointerEvent) {
            if (!fabContainerRef.current) return;
            if (fabContainerRef.current.contains(event.target as Node)) return;

            const target = event.target as HTMLElement;
            const isObsidianMenuOrModal = target.closest('.menu, .modal, .modal-bg');
            if (isObsidianMenuOrModal) return;

            setMenuIsOpen(false);
        }

        document.addEventListener('pointerdown', handleClickOutside);
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, []);

    React.useEffect(() => {
        if (props.initialMenuOpen) {
            setMenuIsOpen(true);
        }
    }, [props.initialMenuOpen]);

    function handleFABClick() {
        setMenuIsOpen((prev) => !prev);
    }

    function handlePageClick(file: TFile) {
        props.onNavigateToPage(file);
    }

    function handleOpenProjectFolderClick() {
        props.onOpenProjectFolder(props.projectFolder);
        setMenuIsOpen(false);
    }

    function handleNewProjectClick() {
        props.onNewProject?.();
    }

    function handleAddPageClick() {
        props.onAddPage?.();
    }

    const showMenuActions =
        menuIsOpen &&
        (props.parentIsProject
            ? !!props.onAddPage
            : !!(props.onAddPage || props.onNewProject));

    return (
        <div className="ddc_pb_project-pages-fab" ref={fabContainerRef}>
            {menuIsOpen && props.parentIsProject && (
                <div
                    className="ddc_pb_project-pages-fab__page-list-scroll"
                    ref={pageListScrollRef}
                    onScroll={handlePageListScroll}
                >
                    <div
                        ref={pageListInnerRef}
                        className={classNames(
                            'ddc_pb_project-pages-fab__page-list-scroll-inner',
                            !pageListHasOverflow &&
                                'ddc_pb_project-pages-fab__page-list-scroll-inner--bottom-aligned'
                        )}
                    >
                        {pagesInProject.map((file) => (
                            <ProjectPageMenuFileButton
                                key={file.path}
                                file={file}
                                isCurrentPage={file.path === props.currentFile.path}
                                context="fab"
                                onPageClick={handlePageClick}
                                onFileChange={() => setRefreshTrigger((t) => t + 1)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="ddc_pb_project-pages-fab__footer">
                {showMenuActions && (
                    <FabMenuActionButtonStack>
                        {props.parentIsProject ? (
                            <FabMenuActionButton
                                variant="primary"
                                density="compact"
                                label="Add page"
                                onClick={handleAddPageClick}
                            />
                        ) : (
                            <>
                                {props.onAddPage && (
                                    <FabMenuActionButton
                                        variant="primary"
                                        density="compact"
                                        label="Add page"
                                        onClick={handleAddPageClick}
                                    />
                                )}
                                {props.onNewProject && (
                                    <FabMenuActionButton
                                        variant="primary"
                                        density="compact"
                                        label="New project"
                                        onClick={handleNewProjectClick}
                                    />
                                )}
                            </>
                        )}
                    </FabMenuActionButtonStack>
                )}
                <div className="ddc_pb_project-pages-fab__group">
                    <button
                        className={classNames(
                            'ddc_pb_project-pages-fab__main-button',
                            menuIsOpen && 'ddc_pb_active'
                        )}
                        onClick={handleFABClick}
                        title={props.parentIsProject ? 'Project pages' : 'Add page'}
                    >
                        {props.parentIsProject ? <FileStack size={20} /> : <Plus size={20} />}
                    </button>
                    <button
                        className={classNames(
                            'ddc_pb_project-pages-fab__project-title',
                            props.parentIsProject && 'ddc_pb_project-pages-fab__project-title--is-project',
                            !props.parentIsProject && props.parentIsInsideProject && 'ddc_pb_project-pages-fab__project-title--is-inside-project'
                        )}
                        onClick={handleOpenProjectFolderClick}
                        title={
                            isRootPath(props.projectFolder.path)
                                ? 'Open vault root in project browser'
                                : props.parentIsProject
                                  ? `Open ${props.projectFolder.name} in project browser`
                                  : 'Open folder in project browser'
                        }
                    >
                        <ChevronLeft size={16} className="ddc_pb_project-pages-fab__project-title-chevron" />
                        {isRootPath(props.projectFolder.path) ? 'Home' : props.projectFolder.name}
                    </button>
                </div>
            </div>
        </div>
    );
};
