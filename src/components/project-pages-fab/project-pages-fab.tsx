import './project-pages-fab.scss';
import { TAbstractFile, TFile, TFolder } from 'obsidian';
import * as React from 'react';
import { ExternalLink, FilePlus, FileStack, Folder, Plus } from 'lucide-react';
import classNames from 'classnames';
import { getItemsInFolder } from 'src/logic/folder-processes';
import { isExtensionVisible } from 'src/logic/file-type-filter';
import { getFileDisplayNameParts } from 'src/logic/get-file-display-name';
import { getFileTypeLabel } from 'src/logic/get-file-type-label';
import { isExtensionUnsupportedByObsidian } from 'src/logic/is-extension-unsupported';

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

export const ProjectPagesFAB = (props: ProjectPagesFABProps) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(!!props.initialMenuOpen);
    const [refreshTrigger, setRefreshTrigger] = React.useState(0);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);

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

    React.useEffect(() => {
        function handleClickOutside(event: PointerEvent) {
            if (fabContainerRef.current && !fabContainerRef.current.contains(event.target as Node)) {
                setMenuIsOpen(false);
            }
        }

        document.addEventListener('pointerdown', handleClickOutside);
        return () => document.removeEventListener('pointerdown', handleClickOutside);
    }, []);

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

    const folderButtonLabel = props.parentIsProject
        ? props.projectFolder.name
        : 'Folder';

    const folderButtonTitle = props.parentIsProject
        ? `Open ${props.projectFolder.name} in project browser`
        : 'Open folder in project browser';

    return (
        <div className="ddc_pb_project-pages-fab" ref={fabContainerRef}>
            {menuIsOpen && (
                <div className="ddc_pb_project-pages-fab__page-buttons">
                    {props.parentIsProject && pagesInProject.map((file) => {
                        const isCurrentPage = file.path === props.currentFile.path;
                        const fileTypeLabel = getFileTypeLabel(file.extension ?? '');
                        const isUnsupported = isExtensionUnsupportedByObsidian(file.extension ?? '');
                        const { basename, extension } = getFileDisplayNameParts(file);
                        return (
                            <button
                                key={file.path}
                                className={classNames(
                                    'ddc_pb_project-pages-fab__page-button',
                                    isCurrentPage && 'ddc_pb_project-pages-fab__page-button--active'
                                )}
                                onClick={isCurrentPage ? undefined : () => handlePageClick(file)}
                                disabled={isCurrentPage}
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
                    })}
                    {props.parentIsProject && props.onAddPage && (
                        <button
                            className="ddc_pb_project-pages-fab__action-button"
                            onClick={handleAddPageClick}
                            title="Add page"
                        >
                            <FilePlus size={16} />
                            <span className="ddc_pb_project-pages-fab__action-button-label">
                                Add page
                            </span>
                        </button>
                    )}
                    {!props.parentIsProject && (
                        <>
                            {props.onNewFile && (
                                <button
                                    className="ddc_pb_project-pages-fab__action-button"
                                    onClick={handleNewFileClick}
                                    title="New file"
                                >
                                    <Plus size={16} />
                                    <span className="ddc_pb_project-pages-fab__action-button-label">
                                        New file
                                    </span>
                                </button>
                            )}
                            {props.onAddPage && (
                                <button
                                    className="ddc_pb_project-pages-fab__action-button"
                                    onClick={handleAddPageClick}
                                    title="Add page"
                                >
                                    <FilePlus size={16} />
                                    <span className="ddc_pb_project-pages-fab__action-button-label">
                                        Add page
                                    </span>
                                </button>
                            )}
                        </>
                    )}
                    <button
                        className="ddc_pb_project-pages-fab__folder-button"
                        onClick={handleOpenProjectFolderClick}
                        title={folderButtonTitle}
                    >
                        <Folder size={16} />
                        <span className="ddc_pb_project-pages-fab__folder-button-label">
                            {folderButtonLabel}
                        </span>
                    </button>
                </div>
            )}
            <button
                className={classNames(
                    'ddc_pb_project-pages-fab__main-button',
                    menuIsOpen && 'ddc_pb_active'
                )}
                onClick={handleFABClick}
                title="Project pages"
            >
                <FileStack size={24} />
            </button>
        </div>
    );
};
