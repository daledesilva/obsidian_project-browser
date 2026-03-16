import './card-browser-floating-menu.scss';
import { TFolder } from 'obsidian';
import * as React from "react";
import { ChevronLeft, Plus, Search } from 'lucide-react';
import { createFolder, createProject } from 'src/utils/file-manipulation';
import { openNewPageAndSelectTitle } from 'src/logic/file-access-processes';
import { isRootPath } from 'src/utils/string-processes';
import classNames from 'classnames';

//////////
//////////

interface CardBrowserFloatingMenuProps {
    folder: TFolder;
    parentFolder: TFolder | null;
    parentFolderIsProject: boolean;
    currentFolderIsProject: boolean;
    onOpenParentFolder: () => void;
    onFolderCreated?: () => void;
    searchActive: boolean;
    activateSearch: () => void;
    deactivateSearch: () => void;
}

function getNextNewFolderPath(parentFolder: TFolder): string {
    const vault = parentFolder.vault;
    const basePath = parentFolder.path ? `${parentFolder.path}/` : '';
    let name = 'New folder';
    let fullPath = `${basePath}${name}`;
    let n = 2;
    while (vault.getAbstractFileByPath(fullPath)) {
        name = `New folder ${n}`;
        fullPath = `${basePath}${name}`;
        n++;
    }
    return fullPath;
}

export const CardBrowserFloatingMenu = (props: CardBrowserFloatingMenuProps) => {
    const [menuIsOpen, setMenuIsOpen] = React.useState(false);
    const fabContainerRef = React.useRef<HTMLDivElement>(null);

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

    async function handleNewFileOrPage() {
        try {
            const newFile = await createProject({
                parentFolder: props.folder,
                projectName: 'Untitled',
            });
            openNewPageAndSelectTitle(newFile);
        } catch (reason) {
            console.log(reason);
        }
        setMenuIsOpen(false);
    }

    async function handleNewFolder() {
        try {
            const folderPath = getNextNewFolderPath(props.folder);
            await createFolder(folderPath);
            props.onFolderCreated?.();
        } catch (reason) {
            console.log(reason);
        }
        setMenuIsOpen(false);
    }

    const fileOrPageLabel = props.currentFolderIsProject ? 'New page' : 'New file';

    const actionButtonStyle = props.currentFolderIsProject ? '--primary' : '--secondary';

    return (
        <div className="ddc_pb_card-browser-floating-menu" ref={fabContainerRef}>
            <div className="ddc_pb_card-browser-floating-menu__group">
                {menuIsOpen && (
                    <div className="ddc_pb_card-browser-floating-menu__action-buttons">
                        <button
                            className={classNames(
                                'ddc_pb_card-browser-floating-menu__action-button',
                                `ddc_pb_card-browser-floating-menu__action-button${actionButtonStyle}`
                            )}
                            onClick={handleNewFileOrPage}
                            title={fileOrPageLabel}
                        >
                            <Plus size={16} />
                            <span className="ddc_pb_card-browser-floating-menu__action-button-label">
                                {fileOrPageLabel}
                            </span>
                        </button>
                        <button
                            className={classNames(
                                'ddc_pb_card-browser-floating-menu__action-button',
                                `ddc_pb_card-browser-floating-menu__action-button${actionButtonStyle}`
                            )}
                            onClick={handleNewFolder}
                            title="New folder"
                        >
                            <Plus size={16} />
                            <span className="ddc_pb_card-browser-floating-menu__action-button-label">
                                New folder
                            </span>
                        </button>
                    </div>
                )}
                <button
                    className={classNames(
                        'ddc_pb_card-browser-floating-menu__search-button',
                        props.searchActive && 'ddc_pb_active'
                    )}
                    onClick={() => {
                        if (props.searchActive) {
                            props.deactivateSearch();
                        } else {
                            props.activateSearch();
                        }
                    }}
                    title="Search"
                >
                    <Search size={20} />
                </button>
                <button
                    className={classNames(
                        'ddc_pb_card-browser-floating-menu__new-button',
                        menuIsOpen && 'ddc_pb_active'
                    )}
                    onClick={() => setMenuIsOpen((prev) => !prev)}
                    title={menuIsOpen ? 'Close menu' : 'New'}
                >
                    <Plus size={33} />
                </button>
                <button
                    className={classNames(
                        'ddc_pb_card-browser-floating-menu__folder-title',
                        props.parentFolderIsProject &&
                            'ddc_pb_card-browser-floating-menu__folder-title--is-project',
                        props.parentFolder === null &&
                            'ddc_pb_card-browser-floating-menu__folder-title--hidden'
                    )}
                    onClick={props.parentFolder !== null ? props.onOpenParentFolder : undefined}
                    title={
                        props.parentFolder === null
                            ? undefined
                            : isRootPath(props.parentFolder.path)
                              ? 'Open vault root in browser'
                              : `Open ${props.parentFolder.name} in browser`
                    }
                >
                    <ChevronLeft size={16} className="ddc_pb_card-browser-floating-menu__folder-title-chevron" />
                    {props.parentFolder === null ? '' : isRootPath(props.parentFolder.path) ? 'Home' : props.parentFolder.name}
                </button>
            </div>
        </div>
    );
};
