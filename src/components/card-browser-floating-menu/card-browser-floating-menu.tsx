import './card-browser-floating-menu.scss';
import { TFolder } from 'obsidian';
import * as React from "react";
import { ChevronLeft, Plus, Search } from 'lucide-react';
import { createProject } from 'src/utils/file-manipulation';
import { openNewPageAndSelectTitle } from 'src/logic/file-access-processes';
import { isRootPath } from 'src/utils/string-processes';
import classNames from 'classnames';

//////////
//////////

interface CardBrowserFloatingMenuProps {
    folder: TFolder;
    parentFolder: TFolder | null;
    parentFolderIsProject: boolean;
    onOpenParentFolder: () => void;
    searchActive: boolean;
    activateSearch: () => void;
    deactivateSearch: () => void;
}

export const CardBrowserFloatingMenu = (props: CardBrowserFloatingMenuProps) => {
    async function newProject(folder: TFolder) {
        try {
            const newFile = await createProject({
                parentFolder: folder,
                projectName: 'Untitled',
            });
            openNewPageAndSelectTitle(newFile);
        } catch (reason) {
            console.log(reason);
        }
    }

    return (
        <div className="ddc_pb_card-browser-floating-menu">
            <div className="ddc_pb_card-browser-floating-menu__group">
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
                    className="ddc_pb_card-browser-floating-menu__new-button"
                    onClick={() => newProject(props.folder)}
                    title="New project"
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
