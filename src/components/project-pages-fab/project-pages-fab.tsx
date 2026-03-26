import './project-pages-fab.scss';
import { TAbstractFile, TFile, TFolder } from 'obsidian';
import * as React from 'react';
import { ChevronLeft, ExternalLink, FileStack, Plus } from 'lucide-react';
import classNames from 'classnames';
import { registerFileContextMenu } from 'src/context-menus/file-context-menu';
import { getItemsInFolder } from 'src/logic/folder-processes';
import { isExtensionVisible } from 'src/logic/file-type-filter';
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { getFileTypeLabel } from 'src/logic/get-file-type-label';
import { isExtensionUnsupportedByObsidian } from 'src/logic/is-extension-unsupported';
import { getGlobals } from 'src/logic/stores';
import { isRootPath } from 'src/utils/string-processes';

//////////
//////////

interface ProjectPagesFABProps {
    projectFolder: TFolder;
    currentFile: TFile;
    parentIsProject: boolean;
    initialMenuOpen?: boolean;
    onNavigateToPage: (file: TFile) => void;
    onOpenProjectFolder: (folder: TFolder) => void;
    onNewFile?: () => void | Promise<void>;
    onAddPage?: () => void | Promise<void>;
}

function isPathInFolder(filePath: string, parentPath: string): boolean {
    const fileParentPath = filePath.includes('/') ? filePath.substring(0, filePath.lastIndexOf('/')) : '';
    return fileParentPath === parentPath;
}

interface PageMenuFileButtonProps {
    file: TFile;
    isCurrentPage: boolean;
    onPageClick: (file: TFile) => void;
    onFileChange: () => void;
}

const PageMenuFileButton = (props: PageMenuFileButtonProps) => {
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const { plugin } = getGlobals();

    React.useEffect(() => {
        if (!plugin || !buttonRef.current) return;
        registerFileContextMenu({
            fileButtonEl: buttonRef.current,
            file: props.file,
            onFileChange: props.onFileChange,
        });
    }, [props.file.path]);

    const fileTypeLabel = getFileTypeLabel(props.file.extension ?? '');
    const isUnsupported = isExtensionUnsupportedByObsidian(props.file.extension ?? '');
    const { basename, extension } = getFileDisplayNameParts(props.file);

    return (
        <button
            ref={buttonRef}
            className={classNames(
                'ddc_pb_project-pages-fab__page-button',
                props.isCurrentPage && 'ddc_pb_project-pages-fab__page-button--active'
            )}
            onClick={props.isCurrentPage ? undefined : () => props.onPageClick(props.file)}
            disabled={props.isCurrentPage}
        >
            {fileTypeLabel && (
                <span className="ddc_pb_project-pages-fab__page-button-tags">
                    <span className="ddc_pb_file-type-tag" aria-hidden>
                        {fileTypeLabel}
                    </span>
                </span>
            )}
            {isUnsupported && (
                <span className="ddc_pb_project-pages-fab__page-button-external-icon">
                    <ExternalLink
                        className="ddc_pb_external-file-icon"
                        aria-label="Opens in external program"
                        size={12}
                    />
                </span>
            )}
            {basename}
            {extension && <span className="ddc_pb_file-ext-faint">{extension}</span>}
        </button>
    );
};

export const ProjectPagesFAB = (props: ProjectPagesFABProps) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(!!props.initialMenuOpen);
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const [pageListHasOverflow, setPageListHasOverflow] = React.useState(false);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);
    const pageListScrollRef = React.useRef<HTMLDivElement>(null);
    const pageListInnerRef = React.useRef<HTMLDivElement>(null);

    const pagesInProject = React.useMemo(() => {
        const items = getItemsInFolder(props.projectFolder);
        if (!items) return [];

        const pageFiles = items
            .filter((item): item is TFile => item instanceof TFile)
            .filter((file) => isExtensionVisible(file.extension, 'pageMenu'));

        return [...pageFiles].sort((a, b) => a.name.localeCompare(b.name));
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

    const updatePageListOverflow = React.useCallback(() => {
        const scrollEl = pageListScrollRef.current;
        if (!scrollEl) return;
        setPageListHasOverflow(scrollEl.scrollHeight > scrollEl.clientHeight + 1);
    }, []);

    React.useLayoutEffect(() => {
        if (!menuIsOpen || !props.parentIsProject) {
            setPageListHasOverflow(false);
            return;
        }
        updatePageListOverflow();
        const frameId = requestAnimationFrame(updatePageListOverflow);
        return () => cancelAnimationFrame(frameId);
    }, [menuIsOpen, props.parentIsProject, pagesInProject, refreshTrigger, updatePageListOverflow]);

    React.useEffect(() => {
        if (typeof ResizeObserver === 'undefined') return;
        if (!menuIsOpen || !props.parentIsProject) return;
        const scrollEl = pageListScrollRef.current;
        const innerEl = pageListInnerRef.current;
        if (!scrollEl) return;
        const resizeObserver = new ResizeObserver(() => updatePageListOverflow());
        resizeObserver.observe(scrollEl);
        if (innerEl) resizeObserver.observe(innerEl);
        return () => resizeObserver.disconnect();
    }, [menuIsOpen, props.parentIsProject, updatePageListOverflow]);

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

    function handleNewFileClick() {
        props.onNewFile?.();
    }

    function handleAddPageClick() {
        props.onAddPage?.();
    }

    const showMenuActions =
        menuIsOpen &&
        (props.parentIsProject
            ? !!props.onAddPage
            : !!(props.onAddPage || props.onNewFile));

    return (
        <div className="ddc_pb_project-pages-fab" ref={fabContainerRef}>
            {menuIsOpen && props.parentIsProject && (
                <div className="ddc_pb_project-pages-fab__page-list-scroll" ref={pageListScrollRef}>
                    <div
                        ref={pageListInnerRef}
                        className={classNames(
                            'ddc_pb_project-pages-fab__page-list-scroll-inner',
                            !pageListHasOverflow &&
                                'ddc_pb_project-pages-fab__page-list-scroll-inner--bottom-aligned'
                        )}
                    >
                        {pagesInProject.map((file) => (
                            <PageMenuFileButton
                                key={file.path}
                                file={file}
                                isCurrentPage={file.path === props.currentFile.path}
                                onPageClick={handlePageClick}
                                onFileChange={() => setRefreshTrigger((t) => t + 1)}
                            />
                        ))}
                    </div>
                </div>
            )}
            <div className="ddc_pb_project-pages-fab__footer">
                {showMenuActions && (
                    <div className="ddc_pb_project-pages-fab__menu-actions">
                        {props.parentIsProject ? (
                            <button
                                className="ddc_pb_project-pages-fab__action-button ddc_pb_project-pages-fab__action-button--primary"
                                onClick={handleAddPageClick}
                                title="Add page"
                            >
                                <Plus size={16} />
                                <span className="ddc_pb_project-pages-fab__action-button-label">Add page</span>
                            </button>
                        ) : (
                            <>
                                {props.onAddPage && (
                                    <button
                                        className="ddc_pb_project-pages-fab__action-button ddc_pb_project-pages-fab__action-button--primary"
                                        onClick={handleAddPageClick}
                                        title="Add page"
                                    >
                                        <Plus size={16} />
                                        <span className="ddc_pb_project-pages-fab__action-button-label">
                                            Add page
                                        </span>
                                    </button>
                                )}
                                {props.onNewFile && (
                                    <button
                                        className="ddc_pb_project-pages-fab__action-button ddc_pb_project-pages-fab__action-button--secondary"
                                        onClick={handleNewFileClick}
                                        title="New file"
                                    >
                                        <Plus size={16} />
                                        <span className="ddc_pb_project-pages-fab__action-button-label">
                                            New file
                                        </span>
                                    </button>
                                )}
                            </>
                        )}
                    </div>
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
                        {props.parentIsProject ? <FileStack size={24} /> : <Plus size={24} />}
                    </button>
                    <button
                        className={classNames(
                            'ddc_pb_project-pages-fab__project-title',
                            props.parentIsProject && 'ddc_pb_project-pages-fab__project-title--is-project'
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
